const { MongoClient } = require("mongodb");
require("dotenv/config");

async function connectToCluster() {
let mongoClient;
  try {
    mongoClient = new MongoClient(process.env.MONGO_URI);
    await mongoClient.connect();
    return mongoClient;
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    process.exit();
  }
}

async function openDb(cluster, dbName=process.env.MONGO_DB) {
  const db = cluster.db(dbName);
  return db;
}

async function closeConnection(connection) {
  return connection.close();

}

module.exports = {
  connectToCluster,
  openDb,
  closeConnection,
};
