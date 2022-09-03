import { MongoClient } from "mongodb";
import "dotenv/config";

export async function connectToCluster() {
    let mongoClient;

    const uri = process.env.ATLAS_URI;
    console.log(uri)
    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
 
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
 }
 
 export async function openDb(cluster) {
    const db = cluster.db("albums");
    return db
 }
 
 export async function closeConnection(connection) {
    return connection.close()
}
 
