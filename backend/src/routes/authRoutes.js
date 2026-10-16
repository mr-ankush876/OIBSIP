const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  verifyDirect,
  resendVerification,
  login,
  adminLogin,
  getMe,
  updateLanguagePreference,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.get('/verify-email', verifyEmail);
router.post('/verify-direct', authLimiter, verifyDirect);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/login', authLimiter, login);
router.post('/admin-login', authLimiter, adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/language', protect, updateLanguagePreference);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password', passwordResetLimiter, resetPassword);

module.exports = router;
