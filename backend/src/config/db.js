const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizzadb';

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[Database] MongoDB Connected to external server: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Notice] Could not connect to external MongoDB at ${mongoUri} (${error.message}).`);

    // In development mode, auto-fallback to embedded MongoDB engine so the user has zero setup hassle!
    try {
      console.log('[Database] Starting embedded MongoDB server (v7.0.14) fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        binary: {
          version: '7.0.14',
        },
      });
      const embeddedUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(embeddedUri);
      console.log(`[Database] Embedded MongoDB Server active! URI: ${embeddedUri}`);

      // Auto-seed embedded database so the app is immediately ready
      const seedData = require('../scripts/seedRunner');
      if (typeof seedData === 'function') {
        await seedData();
      }

      return conn;
    } catch (fallbackErr) {
      console.error(`[Database Error] Embedded database fallback failed: ${fallbackErr.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('[Database] MongoDB Connection Closed');
  } catch (error) {
    console.error(`[Database Error] Disconnection error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
