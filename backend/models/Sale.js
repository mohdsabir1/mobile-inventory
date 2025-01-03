const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  }
});

const saleSchema = new mongoose.Schema({
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MobileModel',
    required: true
  },
  items: {
    type: [saleItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required for a sale'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
saleSchema.index({ createdAt: -1 });
saleSchema.index({ model: 1 });
saleSchema.index({ active: 1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
