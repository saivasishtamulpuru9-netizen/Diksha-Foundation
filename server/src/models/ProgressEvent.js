const mongoose = require('mongoose');

const progressEventSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a student ID'],
    },
    type: {
      type: String,
      enum: [
        'assignment_submitted',
        'assignment_graded',
        'assessment_submitted',
        'assessment_graded',
        'course_completed',
      ],
      required: [true, 'Please specify the progress event type'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceModel: {
      type: String,
    },
    score: {
      type: Number,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.ProgressEvent || mongoose.model('ProgressEvent', progressEventSchema);
