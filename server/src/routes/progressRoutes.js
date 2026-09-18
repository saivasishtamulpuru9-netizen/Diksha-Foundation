const express = require('express');
const { getMyProgress } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, authorize('student'), getMyProgress);

module.exports = router;
