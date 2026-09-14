const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diksha360');
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Warning: Database connection failed (${error.message}).`);
    console.warn(`[MongoDB] Running server in standalone mode.`);
  }
};

module.exports = connectDB;
