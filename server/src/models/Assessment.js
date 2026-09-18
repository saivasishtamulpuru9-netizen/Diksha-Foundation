const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      default: '',
    },
    marks: {
      type: Number,
      default: 1,
    },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assessment title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a teacher to this assessment'],
    },
    questions: [questionSchema],
    totalMarks: {
      type: Number,
      default: 0,
    },
    durationMinutes: {
      type: Number,
      default: 30,
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

module.exports = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
