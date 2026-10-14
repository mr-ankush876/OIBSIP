const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Ingredient category is required'],
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 100,
      min: [0, 'Stock quantity cannot be negative'],
    },
    unit: {
      type: String,
      default: 'portion',
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 20,
      min: [1, 'Threshold must be at least 1'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastAlertSentAt: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to determine if stock is below or equal to threshold
ingredientSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.lowStockThreshold;
});

ingredientSchema.set('toJSON', { virtuals: true });
ingredientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);
