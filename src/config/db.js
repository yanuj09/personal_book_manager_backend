const mongoose = require('mongoose');
const { mongoUri } = require('./env');

// Single place that owns the Mongo connection lifecycle.
async function connectDB() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);

  // Surface post-connection failures instead of letting them pass silently.
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
