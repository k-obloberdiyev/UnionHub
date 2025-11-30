const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'unionhub';

// Connection cache
let cachedDb = null;
let client = null;

async function connectToDatabase() {
  if (cachedDb && client) {
    return { db: cachedDb, client };
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db(DATABASE_NAME);

    cachedDb = db;
    console.log('Connected to MongoDB');
    
    return { db, client };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    cachedDb = null;
    console.log('MongoDB connection closed');
  }
}

// Helper functions
function createObjectId(id) {
  return new ObjectId(id);
}

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  createObjectId,
  isValidObjectId,
  ObjectId
};
