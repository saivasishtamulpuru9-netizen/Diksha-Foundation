const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate signed JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'diksha360_jwt_secret_key_code_for_good_2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Global in-memory fallback store
global.mockUsers = global.mockUsers || [];

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, centerName } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Normalize role
    const normalizedRole = role ? role.toLowerCase() : 'student';
    if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles: 'student', 'teacher', 'admin'",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if DB is connected
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        password,
        role: normalizedRole,
        centerName: centerName || 'Diksha Main Center',
      });

      const token = user.getSignedJwtToken();

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          centerName: user.centerName,
        },
      });
    } else {
      // Fast in-memory standalone mode
      const userExists = global.mockUsers.some((u) => u.email === cleanEmail);
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: normalizedRole,
        centerName: centerName || 'Diksha Main Center',
        getSignedJwtToken: function () {
          return generateToken(this);
        },
      };
      global.mockUsers.push(mockUser);

      const token = generateToken(mockUser);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          centerName: mockUser.centerName,
        },
      });
    }
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;
    let isMatch = false;

    if (isDbConnected) {
      user = await User.findOne({ email: cleanEmail }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    } else {
      user = global.mockUsers.find((u) => u.email === cleanEmail);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = user.getSignedJwtToken
      ? user.getSignedJwtToken()
      : generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        centerName: user.centerName,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile',
    });
  }
};

/**
 * @desc    Test protected route for verification
 * @route   GET /api/auth/protected
 * @access  Private
 */
const getProtectedTest = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Access granted to protected route',
    user: req.user,
  });
};

/**
 * @desc    Test admin-only route for authorization verification
 * @route   GET /api/auth/admin-only
 * @access  Private/Admin
 */
const getAdminOnlyTest = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Access granted to admin-only route',
    user: req.user,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getProtectedTest,
  getAdminOnlyTest,
};
