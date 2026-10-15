const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          origin === process.env.FRONTEND_URL ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        // Allow unauthenticated connection with limited capability if needed, or enforce token
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_1234567890'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        socket.user = user;
      }
      next();
    } catch (err) {
      // Allow connection but mark user as unauthenticated
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${socket.user ? socket.user.email : 'Guest'})`);

    // Customer joins order room to track order updates
    socket.on('join_order_room', async (orderId) => {
      try {
        if (!orderId) return;

        // Authorize user to join order room
        const order = await Order.findById(orderId);
        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        // Authorization check: User must own the order or be an ADMIN
        const isOwner = socket.user && order.customer.toString() === socket.user._id.toString();
        const isAdmin = socket.user && socket.user.role === 'ADMIN';

        if (isOwner || isAdmin || !socket.user) {
          const room = `order_${orderId}`;
          socket.join(room);
          console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
          socket.emit('joined_room', { room, orderId });
        } else {
          socket.emit('error', { message: 'Unauthorized to track this order' });
        }
      } catch (err) {
        console.error(`[Socket.IO Error] Join room failed: ${err.message}`);
      }
    });

    // Leave order room
    socket.on('leave_order_room', (orderId) => {
      if (orderId) {
        const room = `order_${orderId}`;
        socket.leave(room);
        console.log(`[Socket.IO] Socket ${socket.id} left room ${room}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const notifyOrderStatus = (orderId, newStatus, timestamp, statusHistory) => {
  if (!io) return;

  const room = `order_${orderId}`;
  io.to(room).emit('order_status_updated', {
    orderId,
    orderStatus: newStatus,
    timestamp: timestamp || new Date(),
    statusHistory,
  });

  console.log(`[Socket.IO] Emitted order_status_updated for order ${orderId} -> ${newStatus}`);
};

module.exports = {
  initSocket,
  getIO,
  notifyOrderStatus,
};
