const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const {
  connectMongo,
  getDb,
  ensureMongoIndexes,
  closeMongo,
} = require("./db/mongo");

const complaintsFile =
  path.join(
    __dirname,
    "complaints.json"
  );

const usersFile =
  path.join(
    __dirname,
    "users.json"
  );

function readLocalArray(
  filePath
) {
  if (
    !fs.existsSync(
      filePath
    )
  ) {
    return [];
  }

  const content =
    fs.readFileSync(
      filePath,
      "utf8"
    );

  const parsed =
    JSON.parse(
      content || "[]"
    );

  return Array.isArray(parsed)
    ? parsed
    : [];
}

async function upsertDocuments(
  collectionName,
  documents
) {
  const validDocuments =
    (documents || []).filter(
      (document) =>
        document &&
        document.id
    );

  if (
    validDocuments.length ===
    0
  ) {
    console.log(
      `ℹ️ ${collectionName}: no local records to migrate`
    );

    return;
  }

  const db =
    getDb();

  await db
    .collection(
      collectionName
    )
    .bulkWrite(
      validDocuments.map(
        (document) => ({
          updateOne: {
            filter: {
              id:
                document.id,
            },

            update: {
              $set:
                document,
            },

            upsert: true,
          },
        })
      ),
      {
        ordered: false,
      }
    );
}

async function main() {
  try {
    console.log(
      "🚚 NagarSwar local JSON → MongoDB migration"
    );

    await connectMongo();
    await ensureMongoIndexes();

    const users =
      readLocalArray(
        usersFile
      );

    const complaints =
      readLocalArray(
        complaintsFile
      );

    console.log(
      `👤 Local users found: ${users.length}`
    );

    console.log(
      `📋 Local complaints found: ${complaints.length}`
    );

    await upsertDocuments(
      "users",
      users
    );

    await upsertDocuments(
      "complaints",
      complaints
    );

    const db =
      getDb();

    const mongoUsers =
      await db
        .collection("users")
        .countDocuments();

    const mongoComplaints =
      await db
        .collection("complaints")
        .countDocuments();

    console.log("");
    console.log(
      "✅ Migration completed"
    );
    console.log(
      `☁️ MongoDB users: ${mongoUsers}`
    );
    console.log(
      `☁️ MongoDB complaints: ${mongoComplaints}`
    );
    console.log("");
    console.log(
      "Keep users.json and complaints.json as backups until final testing is complete."
    );
  } catch (error) {
    console.error(
      "❌ Migration failed:",
      error
    );

    process.exitCode =
      1;
  } finally {
    await closeMongo();
  }
}

main();
