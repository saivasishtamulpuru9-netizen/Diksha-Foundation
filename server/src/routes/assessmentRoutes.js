const express = require('express');
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getMyAssessmentSubmissions,
} = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('teacher', 'admin'), createAssessment)
  .get(protect, getAssessments);

router.get('/my-submissions', protect, authorize('student'), getMyAssessmentSubmissions);

router.route('/:id').get(protect, getAssessmentById);
router.post('/:id/submit', protect, authorize('student'), submitAssessment);

module.exports = router;
