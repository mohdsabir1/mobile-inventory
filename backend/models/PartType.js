const mongoose = require('mongoose');

const partTypeSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true
  },
  types: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('PartType', partTypeSchema);
