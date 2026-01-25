const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

const dbName = 'tynda_music';
let db;

async function connectToDb() {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
}

function getDb() {
    return db;
}

module.exports = { connectToDb, getDb };