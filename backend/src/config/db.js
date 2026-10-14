const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizzadb';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB Connection Closed');
  } catch (error) {
    console.error(`[Database Error] Disconnection error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
