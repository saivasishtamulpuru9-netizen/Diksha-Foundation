const mongoose = require('mongoose');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { recordProgressEvent } = require('../utils/progressHelper');

global.mockSubmissions = global.mockSubmissions || [];

/**
 * @desc    Get logged-in student's submissions
 * @route   GET /api/submissions/my
 * @access  Private (Student)
 */
const getMySubmissions = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const submissions = await AssignmentSubmission.find({ student: req.user._id })
        .populate('assignment', 'title description maxMarks dueDate course')
        .sort({ submittedAt: -1 });

      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } else {
      const submissions = global.mockSubmissions.filter((s) => String(s.student) === String(req.user._id));
      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    }
  } catch (error) {
    console.error('[Get My Submissions Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving your submissions',
    });
  }
};

/**
 * @desc    Grade an assignment submission (Teacher/Admin)
 * @route   PUT /api/submissions/:id/grade
 * @access  Private (Teacher/Admin)
 */
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    if (typeof marks !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Please provide numerical marks for grading',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid submission ID format',
        });
      }

      let submission = await AssignmentSubmission.findById(id).populate('assignment');
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      submission.marks = marks;
      submission.feedback = feedback || '';
      submission.status = 'graded';
      await submission.save();

      // Trigger progress update & progress event
      await recordProgressEvent({
        studentId: submission.student,
        eventType: 'assignment_graded',
        referenceId: submission._id,
        referenceModel: 'AssignmentSubmission',
        score: marks,
        description: `Graded assignment submission (${marks} marks)`,
      });

      return res.status(200).json({
        success: true,
        message: 'Submission graded successfully',
        data: submission,
      });
    } else {
      const submission = global.mockSubmissions.find((s) => String(s._id) === String(id));
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      submission.marks = marks;
      submission.feedback = feedback || '';
      submission.status = 'graded';

      return res.status(200).json({
        success: true,
        message: 'Submission graded successfully',
        data: submission,
      });
    }
  } catch (error) {
    console.error('[Grade Submission Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error grading submission',
    });
  }
};

module.exports = {
  getMySubmissions,
  gradeSubmission,
};
