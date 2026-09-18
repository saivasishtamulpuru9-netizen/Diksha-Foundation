const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assignment title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a teacher to this assignment'],
    },
    course: {
      type: String,
      default: 'General',
    },
    dueDate: {
      type: Date,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
