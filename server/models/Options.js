const mongoose = require('mongoose');

const optionsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['branch', 'course']
  },
  value: {
    type: String,
    required: true,
    lowercase: true
  },
  label: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique combinations of type and value
optionsSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('Options', optionsSchema); 