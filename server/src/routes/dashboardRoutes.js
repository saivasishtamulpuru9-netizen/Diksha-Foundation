const express = require('express');
const { getTeacherDashboard, getStudentDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherDashboard);
router.get('/student', protect, authorize('student'), getStudentDashboard);

module.exports = router;
