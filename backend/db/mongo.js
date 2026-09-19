const {
  MongoClient,
} = require("mongodb");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (_e) {
  // Ignore if custom DNS fails
}

let client = null;
let database = null;

function getMongoUri() {
  return String(
    process.env.MONGODB_URI || ""
  ).trim();
}

function getMongoDbName() {
  return String(
    process.env.MONGODB_DB_NAME ||
      "nagarswar"
  ).trim();
}

async function connectMongo() {
  if (database) {
    return database;
  }

  const uri =
    getMongoUri();

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing from backend/.env"
    );
  }

  client =
    new MongoClient(
      uri,
      {
        serverSelectionTimeoutMS:
          10000,
      }
    );

  await client.connect();

  database =
    client.db(
      getMongoDbName()
    );

  await database.command({
    ping: 1,
  });

  console.log(
    "✅ MongoDB Atlas connected"
  );

  return database;
}

function getDb() {
  if (!database) {
    throw new Error(
      "MongoDB has not been connected yet."
    );
  }

  return database;
}

async function ensureMongoIndexes() {
  const db =
    getDb();

  await db
    .collection("users")
    .createIndex(
      {
        id: 1,
      },
      {
        unique: true,
      }
    );

  await db
    .collection("users")
    .createIndex(
      {
        email: 1,
      },
      {
        unique: true,
        sparse: true,
      }
    );

  await db
    .collection("users")
    .createIndex(
      {
        phone: 1,
      },
      {
        unique: true,
        sparse: true,
      }
    );

  await db
    .collection("complaints")
    .createIndex(
      {
        id: 1,
      },
      {
        unique: true,
      }
    );

  await db
    .collection("complaints")
    .createIndex({
      citizenId: 1,
      submittedAt: -1,
    });

  await db
    .collection("complaints")
    .createIndex({
      status: 1,
      submittedAt: -1,
    });

  await db
    .collection("complaints")
    .createIndex({
      category: 1,
      submittedAt: -1,
    });
}

async function closeMongo() {
  if (client) {
    await client.close();
  }

  client = null;
  database = null;
}

module.exports = {
  connectMongo,
  getDb,
  ensureMongoIndexes,
  closeMongo,
};
