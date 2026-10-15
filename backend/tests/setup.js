const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServer;

const connectTestDB = async () => {
  const localTmp = path.resolve(__dirname, '../.tmp-test');
  if (!fs.existsSync(localTmp)) fs.mkdirSync(localTmp, { recursive: true });
  process.env.TEMP = localTmp;
  process.env.TMP = localTmp;

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
    instance: {
      dbPath: localTmp,
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  connectTestDB,
  closeTestDB,
  clearTestDB,
};
