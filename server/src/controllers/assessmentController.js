const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const { recordProgressEvent } = require('../utils/progressHelper');

/**
 * @desc    Create new assessment
 * @route   POST /api/assessments
 * @access  Private (Teacher/Admin)
 */
const createAssessment = async (req, res) => {
  try {
    const { title, description, questions, durationMinutes, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an assessment title',
      });
    }

    const formattedQuestions = Array.isArray(questions) ? questions : [];

    // Calculate total marks from question list
    let totalMarks = 0;
    formattedQuestions.forEach((q) => {
      totalMarks += typeof q.marks === 'number' ? q.marks : 1;
    });

    const assessment = await Assessment.create({
      title,
      description: description || '',
      teacher: req.user._id,
      questions: formattedQuestions,
      totalMarks,
      durationMinutes: durationMinutes || 30,
      status: status || 'published',
    });

    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment,
    });
  } catch (error) {
    console.error('[Create Assessment Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating assessment',
    });
  }
};

/**
 * @desc    Get all assessments
 * @route   GET /api/assessments
 * @access  Private
 */
const getAssessments = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase();
    let query = {};

    if (userRole === 'student') {
      query.status = 'published';
    } else if (userRole === 'teacher') {
      query.teacher = req.user._id;
    }

    const assessments = await Assessment.find(query)
      .populate('teacher', 'name email centerName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    console.error('[Get Assessments Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving assessments',
    });
  }
};

/**
 * @desc    Get single assessment by ID
 * @route   GET /api/assessments/:id
 * @access  Private
 */
const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format',
      });
    }

    const assessment = await Assessment.findById(id).populate('teacher', 'name email centerName');
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('[Get Assessment By ID Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving assessment',
    });
  }
};

/**
 * @desc    Submit assessment answers & auto-grade (Student)
 * @route   POST /api/assessments/:id/submit
 * @access  Private (Student)
 */
const submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format',
      });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    // Check for existing submission
    const existing = await AssessmentSubmission.findOne({
      assessment: id,
      student: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assessment',
      });
    }

    const studentAnswers = Array.isArray(answers) ? answers : [];
    let calculatedScore = 0;

    // Auto-grading: compare student answer with correct answer
    studentAnswers.forEach((ans) => {
      const qIndex = ans.questionIndex;
      if (
        typeof qIndex === 'number' &&
        assessment.questions &&
        assessment.questions[qIndex]
      ) {
        const question = assessment.questions[qIndex];
        if (
          question.correctAnswer &&
          ans.answer &&
          question.correctAnswer.trim().toLowerCase() === ans.answer.trim().toLowerCase()
        ) {
          calculatedScore += question.marks || 1;
        }
      }
    });

    const submission = await AssessmentSubmission.create({
      assessment: id,
      student: req.user._id,
      answers: studentAnswers,
      score: calculatedScore,
      status: 'graded',
      submittedAt: new Date(),
    });

    // Record progress event & update streak/score
    await recordProgressEvent({
      studentId: req.user._id,
      eventType: 'assessment_submitted',
      referenceId: submission._id,
      referenceModel: 'AssessmentSubmission',
      score: calculatedScore,
      description: `Completed assessment '${assessment.title}' with score ${calculatedScore}/${assessment.totalMarks}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Assessment submitted and graded successfully',
      data: submission,
    });
  } catch (error) {
    console.error('[Submit Assessment Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting assessment',
    });
  }
};

/**
 * @desc    Get logged-in student's assessment submissions
 * @route   GET /api/assessments/my-submissions
 * @access  Private (Student)
 */
const getMyAssessmentSubmissions = async (req, res) => {
  try {
    const submissions = await AssessmentSubmission.find({ student: req.user._id })
      .populate('assessment', 'title description totalMarks durationMinutes')
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('[Get My Assessment Submissions Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving assessment submissions',
    });
  }
};

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getMyAssessmentSubmissions,
};
