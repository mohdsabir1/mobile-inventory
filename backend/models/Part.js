const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MobileModel',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MobileCategory',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  threshold: {
    type: Number,
    default: 5,
    min: 0
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique part name per model when active
partSchema.index({ name: 1, type: 1, model: 1, active: 1 }, { unique: true });

// Add indexes for better query performance
partSchema.index({ model: 1, active: 1 });
partSchema.index({ category: 1, active: 1 });

module.exports = mongoose.model('Part', partSchema);
