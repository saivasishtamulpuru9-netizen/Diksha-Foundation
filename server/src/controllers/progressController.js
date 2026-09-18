const Progress = require('../models/Progress');
const ProgressEvent = require('../models/ProgressEvent');
const Assignment = require('../models/Assignment');
const Assessment = require('../models/Assessment');

/**
 * @desc    Get logged-in student's progress summary
 * @route   GET /api/progress/me
 * @access  Private (Student)
 */
const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch total published assignments and assessments
    const totalAssignments = await Assignment.countDocuments({ status: 'published' });
    const totalAssessments = await Assessment.countDocuments({ status: 'published' });

    let progress = await Progress.findOne({ student: studentId });

    if (!progress) {
      progress = await Progress.create({
        student: studentId,
        totalAssignments,
        totalAssessments,
        assignmentsCompleted: 0,
        assessmentsCompleted: 0,
        averageScore: 0,
        completionPercentage: 0,
        currentStreak: 1,
        lastActivityAt: new Date(),
      });
    }

    // Fetch recent progress events
    const recentEvents = await ProgressEvent.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        progress,
        recentEvents,
      },
    });
  } catch (error) {
    console.error('[Get My Progress Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving progress',
    });
  }
};

module.exports = {
  getMyProgress,
};
