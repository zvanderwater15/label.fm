const { MongoMemoryServer } = require("mongodb-memory-server");
const client = require("../lib/db/conn.js");
const MongoClient = require("mongodb").MongoClient;

// create local database with the given name or connect if it already exists
async function createDB(uri, dbName) {
  var url = `${uri}/${dbName}`;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Database created!", url);
    db.close();
  });
}
async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  global.__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf("/"));
  const connection = await client.connectToCluster();
  const db = await client.openDb(connection, process.env.MONGO_DB);
  await db.dropDatabase();
  await createDB(process.env.MONGO_URI, process.env.MONGO_DB);
  await client.closeConnection(connection);
}

module.exports = globalSetup;
