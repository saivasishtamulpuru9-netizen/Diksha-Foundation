const LeaderboardScore = require('../models/LeaderboardScore');

/**
 * @desc    Get leaderboard rankings
 * @route   GET /api/leaderboard
 * @access  Private
 */
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await LeaderboardScore.find()
      .populate('student', 'name email centerName role')
      .sort({ totalScore: -1, updatedAt: -1 })
      .limit(50);

    // Filter out any non-student users if present
    const studentLeaderboard = leaderboard.filter(
      (entry) => entry.student && entry.student.role !== 'teacher' && entry.student.role !== 'admin'
    );

    // Format output with rank numbers
    const rankedData = studentLeaderboard.map((entry, index) => ({
      rank: index + 1,
      _id: entry._id,
      student: {
        _id: entry.student._id,
        name: entry.student.name,
        email: entry.student.email,
        centerName: entry.student.centerName || 'Diksha Center',
      },
      totalScore: entry.totalScore || 0,
      assignmentsScore: entry.assignmentsScore || 0,
      assessmentsScore: entry.assessmentsScore || 0,
      completedAssignments: entry.completedAssignments || 0,
      completedAssessments: entry.completedAssessments || 0,
    }));

    return res.status(200).json({
      success: true,
      count: rankedData.length,
      data: rankedData,
    });
  } catch (error) {
    console.error('[Get Leaderboard Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving leaderboard',
    });
  }
};

module.exports = {
  getLeaderboard,
};
