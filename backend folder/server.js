const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('⚠️ Warning: Failed to set custom DNS servers, using system defaults.', err.message);
}
dns.setDefaultResultOrder('ipv4first');

const http = require('http');
const dotenv = require('dotenv');

// Load environment variables before importing components that rely on them
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const socketManager = require('./sockets/socketManager');

const PORT = process.env.PORT || 5000;

// Initialize Server Startup
const startServer = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create HTTP Server
  const server = http.createServer(app);

  // 3. Initialize Socket.io
  socketManager.init(server);
  console.log('🔌 Socket.io server initialized successfully');

  // 4. Start listening
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📋 API Reference:   http://localhost:${PORT}/`);
    console.log(`📚 Swagger Docs:    http://localhost:${PORT}/api-docs`);
    console.log(`❤️  Health Check:    http://localhost:${PORT}/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

startServer();
