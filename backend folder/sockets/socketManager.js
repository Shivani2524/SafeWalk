const socketIo = require('socket.io');

let io;
const connectedUsers = new Map(); // Maps userId -> socket.id

const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // Allow all origins for simplicity in development/hackathons
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // User authenticates/joins their own room to receive alerts
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        connectedUsers.set(userId, socket.id);
        console.log(`👤 User ${userId} joined room ${userId} (socket: ${socket.id})`);
      }
    });

    // Trusted contacts join a specific user's tracking room
    socket.on('track-user', (targetUserId) => {
      if (targetUserId) {
        socket.join(`track_${targetUserId}`);
        console.log(`👀 Socket ${socket.id} is now tracking user ${targetUserId}`);
      }
    });

    // Handle manual disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`👤 User ${userId} connection mapping cleared`);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Emit live location updates
const emitLocationUpdate = (userId, locationData) => {
  if (!io) return;
  
  const payload = {
    userId,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    timestamp: new Date()
  };

  // Broadcast to track room
  io.to(`track_${userId}`).emit('location_update', payload);
  // Broadcast globally (useful for dashboard listening)
  io.emit('location_update', payload);

  // Legacy compatibility
  io.to(`track_${userId}`).emit('location-update', {
    userId,
    location: { lat: locationData.latitude, lng: locationData.longitude },
    timestamp: new Date()
  });

  console.log(`🛰️  [SOCKET] Emitted 'location_update' for user ${userId}:`, locationData);
};

// Emit SOS Alert
const emitSosAlert = (userId, alertData) => {
  if (!io) return;
  
  const payload = {
    userId,
    sosId: alertData.sosId || alertData._id,
    latitude: alertData.latitude,
    longitude: alertData.longitude,
    type: alertData.type || 'manual',
    status: alertData.status || 'ACTIVE',
    timestamp: new Date()
  };

  // Broadcast to track room
  io.to(`track_${userId}`).emit('sos_alert', payload);
  // Broadcast globally
  io.emit('sos_alert', payload);

  // Legacy compatibility
  io.to(`track_${userId}`).emit('sos-alert', {
    userId,
    alertId: alertData.sosId || alertData._id,
    location: { lat: alertData.latitude, lng: alertData.longitude },
    userName: alertData.userName
  });

  console.log(`🚨 [SOCKET] Emitted 'sos_alert' for user ${userId}:`, payload);
};

module.exports = {
  init,
  getIO,
  emitLocationUpdate,
  emitSosAlert
};
