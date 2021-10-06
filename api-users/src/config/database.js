const MongoClient = require('mongodb').MongoClient;
const { MongoMemoryServer } = require('mongodb-memory-server');
let client = null;

async function connect () {
  let uri = process.env.MONGO_CONNECTION;

  if (!client) {
    if (process.env.NODE_ENV === 'test') {
      const mongod = await MongoMemoryServer.create();
      uri = await mongod.getUri();
    }

    client = new MongoClient(uri);
  }

  await client.connect();
  return client.db(process.env.DATABASE_NAME);
}

async function disconnect () {
  if (!client) {
    return true;
  }

  await client.close();
  client = null;
  return true;
}

module.exports = {
  connect,
  disconnect
};
