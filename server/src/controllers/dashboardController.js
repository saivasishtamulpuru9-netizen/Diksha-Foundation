const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const Progress = require('../models/Progress');
const ProgressEvent = require('../models/ProgressEvent');
const LeaderboardScore = require('../models/LeaderboardScore');
const User = require('../models/User');

global.mockAssignments = global.mockAssignments || [];
global.mockSubmissions = global.mockSubmissions || [];

/**
 * @desc    Get Teacher Dashboard Overview & Statistics
 * @route   GET /api/teacher/dashboard
 * @access  Private (Teacher/Admin)
 */
const getTeacherDashboard = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const teacherId = req.user._id;
      const teacherAssignments = await Assignment.find({ teacher: teacherId });
      const assignmentIds = teacherAssignments.map((a) => a._id);

      const totalSubmissions = await AssignmentSubmission.countDocuments({
        assignment: { $in: assignmentIds },
      });
      const totalAssessments = await Assessment.countDocuments({ teacher: teacherId });
      const totalStudents = await User.countDocuments({ role: 'student' });

      const recentSubmissions = await AssignmentSubmission.find({
        assignment: { $in: assignmentIds },
      })
        .populate('student', 'name email centerName')
        .populate('assignment', 'title course')
        .sort({ submittedAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        data: {
          totalAssignments: teacherAssignments.length,
          totalSubmissions,
          totalAssessments,
          totalStudents,
          recentSubmissions,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        data: {
          totalAssignments: global.mockAssignments.length,
          totalSubmissions: global.mockSubmissions.length,
          totalAssessments: 0,
          totalStudents: (global.mockUsers || []).filter((u) => u.role === 'student').length,
          recentSubmissions: global.mockSubmissions.slice(0, 5),
        },
      });
    }
  } catch (error) {
    console.error('[Get Teacher Dashboard Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error loading teacher dashboard',
    });
  }
};

/**
 * @desc    Get Student Dashboard Overview & Progress Metrics
 * @route   GET /api/student/dashboard
 * @access  Private (Student)
 */
const getStudentDashboard = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const studentId = req.user._id;

      const totalAssignments = await Assignment.countDocuments({ status: 'published' });
      const totalAssessments = await Assessment.countDocuments({ status: 'published' });

      const submissionsCount = await AssignmentSubmission.countDocuments({ student: studentId });
      const assessmentSubmissionsCount = await AssessmentSubmission.countDocuments({ student: studentId });

      let progress = await Progress.findOne({ student: studentId });
      const averageScore = progress ? progress.averageScore : 0;
      const completionPercentage = progress ? progress.completionPercentage : 0;

      const recentActivity = await ProgressEvent.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(5);

      const allScores = await LeaderboardScore.find().sort({ totalScore: -1 });
      const studentRankIndex = allScores.findIndex(
        (s) => s.student.toString() === studentId.toString()
      );
      const leaderboardPosition = studentRankIndex !== -1 ? studentRankIndex + 1 : 'N/A';

      return res.status(200).json({
        success: true,
        data: {
          student: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            centerName: req.user.centerName || 'Diksha Center',
          },
          assignmentsCount: totalAssignments,
          submissionsCount,
          assessmentsCount: totalAssessments,
          assessmentSubmissionsCount,
          averageScore,
          completionPercentage,
          recentActivity,
          leaderboardPosition,
        },
      });
    } else {
      const studentId = req.user._id;
      const studentSubmissions = global.mockSubmissions.filter((s) => String(s.student) === String(studentId));

      return res.status(200).json({
        success: true,
        data: {
          student: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            centerName: req.user.centerName || 'Diksha Center',
          },
          assignmentsCount: global.mockAssignments.length,
          submissionsCount: studentSubmissions.length,
          assessmentsCount: 0,
          assessmentSubmissionsCount: 0,
          averageScore: studentSubmissions.length > 0 ? 90 : 0,
          completionPercentage: studentSubmissions.length > 0 ? 100 : 0,
          recentActivity: [],
          leaderboardPosition: '1',
        },
      });
    }
  } catch (error) {
    console.error('[Get Student Dashboard Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error loading student dashboard',
    });
  }
};

module.exports = {
  getTeacherDashboard,
  getStudentDashboard,
};
