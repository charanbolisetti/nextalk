const express = require('express');
const Room = require('../models/Room');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/rooms — get all rooms for current user
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', 'username avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } })
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/public — discover public group rooms
router.get('/public', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ type: 'group' })
      .populate('members', 'username avatar isOnline')
      .populate('createdBy', 'username')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rooms — create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, type = 'group', memberIds = [] } = req.body;
    const members = [...new Set([req.user._id.toString(), ...memberIds])];
    const room = await Room.create({
      name, description, type, members,
      admins: [req.user._id],
      createdBy: req.user._id,
    });
    await room.populate('members', 'username avatar isOnline');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/rooms/:id/join
router.post('/:id/join', auth, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user._id } },
      { new: true }
    ).populate('members', 'username avatar isOnline');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/:id/messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
