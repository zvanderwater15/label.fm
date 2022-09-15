const { MongoMemoryServer } = require('mongodb-memory-server');

async function globalTeardown() {
    const instance = global.__MONGOINSTANCE;
    await instance.stop();
};

module.exports = globalTeardown