const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/messages/:roomId
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
