const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['ORDER_DEDUCTION', 'MANUAL_ADJUSTMENT', 'RESTOCK', 'ORDER_CANCELLATION'],
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
