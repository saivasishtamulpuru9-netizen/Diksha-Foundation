const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    answer: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const assessmentSubmissionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Please provide an assessment ID'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a student ID'],
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'graded'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.AssessmentSubmission || mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
