const express = require('express');
const { getMySubmissions, gradeSubmission } = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', protect, authorize('student'), getMySubmissions);
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
