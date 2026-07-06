const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const Room = require('../models/Room');

// Track online users: userId -> socketId
const onlineUsers = new Map();

module.exports = (io) => {
  // Middleware: authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nextalk_secret');
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🟢 ${socket.username} connected [${socket.id}]`);

    // Mark user online
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user:online', { userId, isOnline: true });

    // Join user's rooms automatically
    const userRooms = await Room.find({ members: userId });
    userRooms.forEach(room => socket.join(room._id.toString()));

    // ── JOIN ROOM ──
    socket.on('room:join', async ({ roomId }) => {
      try {
        socket.join(roomId);
        const room = await Room.findById(roomId)
          .populate('members', 'username avatar isOnline lastSeen');
        socket.emit('room:joined', room);
      } catch (err) {
        socket.emit('error', { message: 'Could not join room' });
      }
    });

    // ── SEND MESSAGE ──
    socket.on('message:send', async ({ roomId, content, type = 'text' }) => {
      try {
        const message = await Message.create({
          room: roomId,
          sender: userId,
          content,
          type,
          readBy: [userId],
        });

        await message.populate('sender', 'username avatar');
        await Room.findByIdAndUpdate(roomId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        io.to(roomId).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: 'Could not send message' });
      }
    });

    // ── TYPING INDICATORS ──
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', {
        userId,
        username: socket.username,
        roomId,
      });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { userId, roomId });
    });

    // ── READ RECEIPTS ──
    socket.on('message:read', async ({ messageIds, roomId }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds }, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        io.to(roomId).emit('message:read', { messageIds, userId, roomId });
      } catch (err) {
        socket.emit('error', { message: 'Could not mark as read' });
      }
    });

    // ── DISCONNECT ──
    socket.on('disconnect', async () => {
      console.log(`🔴 ${socket.username} disconnected`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user:online', { userId, isOnline: false, lastSeen: new Date() });
    });
  });
};
