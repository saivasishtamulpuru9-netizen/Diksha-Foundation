const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a student ID'],
      unique: true,
    },
    assignmentsCompleted: {
      type: Number,
      default: 0,
    },
    assessmentsCompleted: {
      type: Number,
      default: 0,
    },
    totalAssignments: {
      type: Number,
      default: 0,
    },
    totalAssessments: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Progress || mongoose.model('Progress', progressSchema);
