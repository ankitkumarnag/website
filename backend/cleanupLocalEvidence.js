const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const {
  connectMongo,
  getDb,
  closeMongo,
} = require("./db/mongo");

const uploadsDir =
  path.join(
    __dirname,
    "uploads"
  );

async function main() {
  const confirmed =
    process.argv.includes(
      "--confirm"
    );

  if (!confirmed) {
    console.log(
      "DRY RUN ONLY — no files will be deleted."
    );

    console.log(
      "After verifying all Cloudinary evidence URLs, run:"
    );

    console.log(
      "node cleanupLocalEvidence.js --confirm"
    );

    return;
  }

  let deleted = 0;
  let missing = 0;
  let skipped = 0;

  try {
    await connectMongo();

    const db =
      getDb();

    const complaints =
      await db
        .collection(
          "complaints"
        )
        .find({
          evidenceStorage:
            "cloudinary",

          evidenceLegacyLocalFileName: {
            $exists: true,
            $ne: "",
          },
        })
        .toArray();

    for (
      const complaint of
      complaints
    ) {
      if (
        !String(
          complaint
            .evidenceUrl ||
            ""
        ).startsWith(
          "https://"
        )
      ) {
        skipped += 1;
        continue;
      }

      const fileName =
        complaint
          .evidenceLegacyLocalFileName;

      const filePath =
        path.join(
          uploadsDir,
          fileName
        );

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        missing += 1;
        continue;
      }

      fs.unlinkSync(
        filePath
      );

      deleted += 1;

      console.log(
        `🗑️ Deleted local backup: ${fileName}`
      );
    }

    console.log("");
    console.log(
      `✅ Deleted: ${deleted}`
    );
    console.log(
      `ℹ️ Already missing: ${missing}`
    );
    console.log(
      `⏭️ Skipped: ${skipped}`
    );
  } catch (
    error
  ) {
    console.error(
      "❌ Local evidence cleanup failed:",
      error
    );

    process.exitCode =
      1;
  } finally {
    await closeMongo();
  }
}

main();
