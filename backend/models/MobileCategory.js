const mongoose = require('mongoose');

const mobileCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add compound index for name and active status
mobileCategorySchema.index({ name: 1, active: 1 }, { unique: true });

module.exports = mongoose.model('MobileCategory', mobileCategorySchema);
