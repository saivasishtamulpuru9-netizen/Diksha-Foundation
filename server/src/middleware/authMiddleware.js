const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Global mock memory store for fallback standalone mode when Mongo is offline
global.mockUsers = global.mockUsers || [];

// Protect routes - Verify JWT Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (Token missing)',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'diksha360_jwt_secret_key_code_for_good_2026'
    );

    // Try finding user in Mongoose DB
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // Ignore DB error if operating in standalone memory mode
    }

    // Fallback to in-memory store if DB query returned null
    if (!user && global.mockUsers) {
      const mock = global.mockUsers.find((u) => u._id.toString() === decoded.id.toString());
      if (mock) {
        user = {
          _id: mock._id,
          name: mock.name,
          email: mock.email,
          role: mock.role,
          centerName: mock.centerName,
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or invalid token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (Invalid token)',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Normalize roles for comparison
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
