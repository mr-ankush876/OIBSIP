const http = require('http');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const { initInventoryCron } = require('./services/cronService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Create HTTP Server
  const httpServer = http.createServer(app);

  // Initialize Socket.IO
  initSocket(httpServer);

  // Initialize node-cron inventory monitoring
  initInventoryCron();

  // Start HTTP Server
  const server = httpServer.listen(PORT, () => {
    console.log(`[Server] SliceCraft Pizza API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] Health check available at: http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`[Server Error] Uncaught Exception: ${err.message}`);
  });

  return server;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { startServer };
