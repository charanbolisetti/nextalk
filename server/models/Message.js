const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  type:    { type: String, enum: ['text', 'image', 'system'], default: 'text' },
  readBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  editedAt:{ type: Date },
}, { timestamps: true });

// Index for fast room message queries
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
