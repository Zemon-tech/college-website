const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorRole: {
    type: String,
    enum: ['admin', 'teacher', 'cr'],
    required: true,
  },
  targetClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Update', updateSchema); 