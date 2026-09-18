const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { recordProgressEvent } = require('../utils/progressHelper');

/**
 * @desc    Create new assignment
 * @route   POST /api/assignments
 * @access  Private (Teacher/Admin)
 */
const createAssignment = async (req, res) => {
  try {
    const { title, description, instructions, course, dueDate, maxMarks, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an assignment title',
      });
    }

    const assignment = await Assignment.create({
      title,
      description: description || '',
      instructions: instructions || '',
      teacher: req.user._id,
      course: course || 'General',
      dueDate: dueDate || null,
      maxMarks: maxMarks || 100,
      status: status || 'published',
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    console.error('[Create Assignment Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating assignment',
    });
  }
};

/**
 * @desc    Get all assignments
 * @route   GET /api/assignments
 * @access  Private
 */
const getAssignments = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase();
    let query = {};

    // Students only see published assignments
    if (userRole === 'student') {
      query.status = 'published';
    } else if (userRole === 'teacher') {
      query.teacher = req.user._id;
    }

    const assignments = await Assignment.find(query)
      .populate('teacher', 'name email centerName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error('[Get Assignments Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving assignments',
    });
  }
};

/**
 * @desc    Get assignment by ID
 * @route   GET /api/assignments/:id
 * @access  Private
 */
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID format',
      });
    }

    const assignment = await Assignment.findById(id).populate('teacher', 'name email centerName');
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error('[Get Assignment By ID Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving assignment',
    });
  }
};

/**
 * @desc    Update assignment
 * @route   PUT /api/assignments/:id
 * @access  Private (Teacher/Admin)
 */
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID format',
      });
    }

    let assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Ownership check: creator or admin
    if (
      assignment.teacher.toString() !== req.user._id.toString() &&
      req.user.role?.toLowerCase() !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment',
      });
    }

    assignment = await Assignment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment,
    });
  } catch (error) {
    console.error('[Update Assignment Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating assignment',
    });
  }
};

/**
 * @desc    Delete assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private (Teacher/Admin)
 */
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID format',
      });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Ownership check
    if (
      assignment.teacher.toString() !== req.user._id.toString() &&
      req.user.role?.toLowerCase() !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment',
      });
    }

    await assignment.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Assignment Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting assignment',
    });
  }
};

/**
 * @desc    Submit assignment (Student)
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, fileUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID format',
      });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check for existing submission by this student
    const existing = await AssignmentSubmission.findOne({
      assignment: id,
      student: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    const submission = await AssignmentSubmission.create({
      assignment: id,
      student: req.user._id,
      content: content || '',
      fileUrl: fileUrl || '',
      submittedAt: new Date(),
      status: 'submitted',
    });

    // Record progress event
    await recordProgressEvent({
      studentId: req.user._id,
      eventType: 'assignment_submitted',
      referenceId: submission._id,
      referenceModel: 'AssignmentSubmission',
      description: `Submitted assignment: ${assignment.title}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error) {
    console.error('[Submit Assignment Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting assignment',
    });
  }
};

/**
 * @desc    Get submissions for an assignment (Teacher/Admin)
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (Teacher/Admin)
 */
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID format',
      });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    const submissions = await AssignmentSubmission.find({ assignment: id })
      .populate('student', 'name email centerName')
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('[Get Assignment Submissions Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving assignment submissions',
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
};
