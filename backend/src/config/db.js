const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let memoryServerInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizzadb';

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[Database] MongoDB Connected to external server: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Notice] Could not connect to external MongoDB at ${mongoUri} (${error.message}).`);

    // In development mode, auto-fallback to embedded MongoDB engine so the user has zero setup hassle!
    try {
      console.log('[Database] Starting embedded MongoDB server (v7.0.14) fallback on local workspace...');
      const localDataDir = path.resolve(__dirname, '../../.mongo-data');
      if (!fs.existsSync(localDataDir)) {
        fs.mkdirSync(localDataDir, { recursive: true });
      }

      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        binary: {
          version: '7.0.14',
        },
        instance: {
          dbPath: localDataDir,
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
      throw fallbackErr;
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
