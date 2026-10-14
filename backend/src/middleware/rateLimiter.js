const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or registration attempts from this IP. Please try again after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip in automated tests
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit password reset requests to 5 per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please wait an hour before trying again.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'High traffic detected from this network. Please slow down your requests.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
};
