const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24']
  },
  quality: {
    type: String,
    required: true,
    enum: ['Light', 'Good', 'Optimal'],
    default: 'Good'
  },
  cycles: {
    type: Number,
    required: true,
    min: [0, 'Cycles cannot be negative'],
    max: [10, 'Cycles cannot exceed 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for user and date
sleepSchema.index({ user: 1, date: 1 }, { unique: true });

const Sleep = mongoose.model('Sleep', sleepSchema);

module.exports = Sleep; 