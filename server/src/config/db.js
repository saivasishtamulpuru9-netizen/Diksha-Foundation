const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diksha360').trim();

    // Ensure database name 'diksha360' is present in connection string if absent
    if (mongoUri.includes('mongodb.net/') && (mongoUri.endsWith('mongodb.net/') || mongoUri.includes('mongodb.net/?'))) {
      mongoUri = mongoUri.replace('mongodb.net/', 'mongodb.net/diksha360');
    } else if (mongoUri.includes('mongodb.net') && !mongoUri.includes('mongodb.net/')) {
      mongoUri = mongoUri.replace('mongodb.net', 'mongodb.net/diksha360');
    }

    // Event listeners for Mongoose connection lifecycle
    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database cluster.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) if Atlas URI is invalid/unreachable
    });

    const isAtlas = conn.connection.host.includes('mongodb.net');
    console.log(`[MongoDB] Connected successfully (${isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB'}): Host=${conn.connection.host} DB=${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Warning: Database connection failed (${error.message}).`);
    console.warn(`[MongoDB] Running server in standalone mode with in-memory fallback.`);
  }
};

module.exports = connectDB;


