const express = require('express');
const router = express.Router();

/**
 * @desc    Get safe public application configuration (WhatsApp number, Razorpay public key, etc.)
 * @route   GET /api/config
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    config: {
      whatsappPhone: process.env.WHATSAPP_SUPPORT_PHONE || '919876543210',
      whatsappMessage: process.env.WHATSAPP_DEFAULT_MESSAGE || 'Hello! I need help with my pizza order on SliceCraft.',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      currency: 'INR',
      currencySymbol: '₹',
      appName: 'SliceCraft Pizza',
    },
  });
});

module.exports = router;
