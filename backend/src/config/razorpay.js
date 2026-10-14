const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes('YourRazorpayKeyIdHere')) {
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    throw new Error('Razorpay secret key is not configured.');
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = {
  getRazorpayInstance,
  verifyPaymentSignature,
};
