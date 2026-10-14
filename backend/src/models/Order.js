const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pizza',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    customDetails: {
      base: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      vegetables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
      baseName: String,
      sauceName: String,
      cheeseName: String,
      vegetableNames: [String],
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [val => val.length > 0, 'An order must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative'],
      default: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: [0, 'Delivery fee cannot be negative'],
      default: 40,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
    },
    orderStatus: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Received',
    },
    statusHistory: [statusHistorySchema],
    stockDeducted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
