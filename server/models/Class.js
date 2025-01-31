const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  section: String,
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  cr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  schedule: [{
    day: String,
    periods: [{
      subject: String,
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      time: String,
      roomNo: String,
    }],
  }],
}, {
  timestamps: true
});

// Add middleware to handle CR removal
classSchema.pre('save', async function(next) {
  if (this.isModified('cr')) {
    const User = mongoose.model('User');
    
    // If CR is being removed or changed
    if (this._original && this._original.cr) {
      await User.findByIdAndUpdate(this._original.cr, {
        'crDetails.assignedClass': null
      });
    }
    
    // If new CR is being assigned
    if (this.cr) {
      await User.findByIdAndUpdate(this.cr, {
        'crDetails.assignedClass': this._id
      });
    }
  }
  next();
});

module.exports = mongoose.model('Class', classSchema); 