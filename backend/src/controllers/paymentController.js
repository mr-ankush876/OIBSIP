const Order = require('../models/Order');
const { getRazorpayInstance, verifyPaymentSignature } = require('../config/razorpay');
const { deductStockForOrder } = require('../services/inventoryService');
const { notifyOrderStatus } = require('../services/socketService');

/**
 * @desc    Create Razorpay Order for an existing pending order
 * @route   POST /api/payments/create-order
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Ownership check
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this order.',
      });
    }

    if (order.paymentStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid for.',
      });
    }

    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(order.totalAmount * 100);

    // If Razorpay instance is null (placeholder/unconfigured credentials in local dev)
    if (!razorpay) {
      const mockRazorpayOrderId = `order_test_${order._id.toString().slice(-8)}_${Date.now()}`;
      order.paymentDetails = {
        razorpayOrderId: mockRazorpayOrderId,
      };
      await order.save();

      return res.status(200).json({
        success: true,
        isTestMode: true,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        razorpayOrderId: mockRazorpayOrderId,
        amount: amountInPaise,
        currency: 'INR',
        orderId: order._id,
        notes: {
          testModeNotice: 'Razorpay credentials not configured or in test sandbox mode.',
        },
      });
    }

    // Real Razorpay API Order Creation
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        customerId: req.user._id.toString(),
      },
    });

    order.paymentDetails = {
      razorpayOrderId: razorpayOrder.id,
    };
    await order.save();

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature and deduct inventory
 * @route   POST /api/payments/verify
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters.',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Prevent duplicate confirmation and duplicate deduction (Requirement 11.11)
    if (order.paymentStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been verified and processed for this order.',
      });
    }

    const razorpay = getRazorpayInstance();
    let isSignatureValid = false;

    if (razorpay) {
      // Validate signature cryptographically
      if (!razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay signature is required for payment verification.',
        });
      }
      isSignatureValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    } else {
      // In development test mode with unconfigured keys, allow test verification
      isSignatureValid = Boolean(razorpayPaymentId && razorpayOrderId);
    }

    if (!isSignatureValid) {
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    // Payment successfully verified
    order.paymentStatus = 'COMPLETED';
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature || 'test_signature',
      paidAt: new Date(),
    };

    // Atomically deduct stock (Section 15)
    await deductStockForOrder(order, req.user._id);

    await order.save();

    // Emit real-time notification
    notifyOrderStatus(order._id, order.orderStatus, new Date(), order.statusHistory);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your pizza order is confirmed.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
