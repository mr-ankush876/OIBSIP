const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');

// Helper to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_1234567890',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to set cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        preferredLanguage: user.preferredLanguage || 'en',
      },
    });
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, preferredLanguage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'CUSTOMER',
      isVerified: false,
      preferredLanguage: preferredLanguage || 'en',
    });

    const rawToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, rawToken, user.name, user.preferredLanguage);
    } catch (emailErr) {
      console.error(`[Email Error] Failed to send verification email: ${emailErr.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully! We sent a verification link to your email. Please verify your account to log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email using token
 * @route   GET /api/auth/verify-email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired. Please request a new verification email.',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Your email has been verified successfully! You can now log in to your account.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend email verification
 * @route   POST /api/auth/resend-verification
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. You can log in directly.',
      });
    }

    const rawToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(user.email, rawToken, user.name, user.preferredLanguage);

    res.status(200).json({
      success: true,
      message: 'A new verification email has been dispatched.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Customer & Admin Login
 * @route   POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    // Unverified customer check (Requirement 9)
    if (user.role === 'CUSTOMER' && !user.isVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Your email address has not been verified yet. Please check your inbox or request a new verification link.',
      });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dedicated Admin Login
 * @route   POST /api/auth/admin-login
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both admin email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid administrator credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid administrator credentials.',
      });
    }

    sendTokenResponse(user, 200, res, 'Admin authenticated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        preferredLanguage: user.preferredLanguage || 'en',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer language preference
 * @route   PUT /api/auth/language
 */
const updateLanguagePreference = async (req, res, next) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ success: false, message: 'Language code is required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredLanguage: language },
      { new: true }
    );

    res.status(200).json({
      success: true,
      preferredLanguage: user.preferredLanguage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Prevent account enumeration: return success even if user does not exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
    }

    const rawToken = user.generatePasswordResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, rawToken, user.name, user.preferredLanguage);
    } catch (err) {
      console.error(`[Email Error] Failed to send password reset: ${err.message}`);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password with token
 * @route   PUT /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout customer
 * @route   POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  adminLogin,
  getMe,
  updateLanguagePreference,
  forgotPassword,
  resetPassword,
  logout,
};
