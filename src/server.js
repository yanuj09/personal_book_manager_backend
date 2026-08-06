const app = require('./app');
const { port, nodeEnv } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

// The database is connected *before* the port opens, so the API is never
// reachable in a state where every request would fail.
async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`Personal Book Manager API listening on http://localhost:${port} (${nodeEnv})`);
  });

  // Finish in-flight requests and close the Mongo connection before exiting.
  const shutdown = (signal) => async () => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown('SIGINT'));
  process.on('SIGTERM', shutdown('SIGTERM'));

  // A rejection that reaches here means a bug escaped a handler — crash loudly
  // rather than continuing in an unknown state.
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
    server.close(() => process.exit(1));
  });
}

start();
