const express = require('express');
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('teacher', 'admin'), createAssignment)
  .get(protect, getAssignments);

router
  .route('/:id')
  .get(protect, getAssignmentById)
  .put(protect, authorize('teacher', 'admin'), updateAssignment)
  .delete(protect, authorize('teacher', 'admin'), deleteAssignment);

router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), getAssignmentSubmissions);

module.exports = router;
