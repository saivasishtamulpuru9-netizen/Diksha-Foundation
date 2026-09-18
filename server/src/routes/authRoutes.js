const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  getProtectedTest,
  getAdminOnlyTest,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.get('/protected', protect, getProtectedTest);

// Role-restricted routes
router.get('/admin-only', protect, authorize('admin'), getAdminOnlyTest);

module.exports = router;
