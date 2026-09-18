const mongoose = require('mongoose');

const leaderboardScoreSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a student ID'],
      unique: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    assignmentsScore: {
      type: Number,
      default: 0,
    },
    assessmentsScore: {
      type: Number,
      default: 0,
    },
    completedAssignments: {
      type: Number,
      default: 0,
    },
    completedAssessments: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.LeaderboardScore || mongoose.model('LeaderboardScore', leaderboardScoreSchema);
