const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    // If no MongoDB URI provided, skip database connection for now
    if (!mongoURI || mongoURI.includes('username:password') || mongoURI.includes('xxxxx')) {
      console.log('⚠️  MongoDB not configured. Running without database.');
      console.log('📝 To set up MongoDB:');
      console.log('   1. Go to https://cloud.mongodb.com');
      console.log('   2. Create free account and cluster');
      console.log('   3. Get connection string');
      console.log('   4. Update MONGODB_URI in .env file');
      return;
    }
    
    // Configure mongoose options for better connection handling
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };
    
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Continuing without database...');
  }
};

module.exports = connectDB;
