const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '', maxlength: 200 },
  type:        { type: String, enum: ['group', 'direct'], default: 'group' },
  avatar:      { type: String, default: '' },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

roomSchema.pre('save', function (next) {
  if (!this.avatar) {
    this.avatar = `https://api.dicebear.com/8.x/identicon/svg?seed=${this.name}`;
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
