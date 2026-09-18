const Progress = require('../models/Progress');
const ProgressEvent = require('../models/ProgressEvent');
const LeaderboardScore = require('../models/LeaderboardScore');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');

/**
 * Recalculate and update Progress, LeaderboardScore, and record ProgressEvent
 */
const recordProgressEvent = async ({
  studentId,
  eventType,
  referenceId,
  referenceModel,
  score = 0,
  description = '',
}) => {
  try {
    // 1. Log Progress Event
    await ProgressEvent.create({
      student: studentId,
      type: eventType,
      referenceId,
      referenceModel,
      score,
      description,
    });

    // 2. Fetch total count of published assignments and assessments
    const totalAssignments = await Assignment.countDocuments({ status: 'published' });
    const totalAssessments = await Assessment.countDocuments({ status: 'published' });

    // 3. Fetch student's assignment submissions
    const assignmentSubmissions = await AssignmentSubmission.find({ student: studentId });
    const completedAssignments = assignmentSubmissions.length;
    let assignmentsScore = 0;
    assignmentSubmissions.forEach((sub) => {
      if (typeof sub.marks === 'number') {
        assignmentsScore += sub.marks;
      }
    });

    // 4. Fetch student's assessment submissions
    const assessmentSubmissions = await AssessmentSubmission.find({ student: studentId });
    const completedAssessments = assessmentSubmissions.length;
    let assessmentsScore = 0;
    assessmentSubmissions.forEach((sub) => {
      if (typeof sub.score === 'number') {
        assessmentsScore += sub.score;
      }
    });

    // 5. Calculate scores and metrics
    const totalScore = assignmentsScore + assessmentsScore;
    const totalCompleted = completedAssignments + completedAssessments;
    const averageScore = totalCompleted > 0 ? Math.round((totalScore / totalCompleted) * 10) / 10 : 0;
    const totalAvailable = Math.max(1, totalAssignments + totalAssessments);
    const completionPercentage = Math.min(100, Math.round((totalCompleted / totalAvailable) * 100));

    // 6. Update or Create Progress document
    await Progress.findOneAndUpdate(
      { student: studentId },
      {
        student: studentId,
        assignmentsCompleted,
        assessmentsCompleted,
        totalAssignments,
        totalAssessments,
        averageScore,
        completionPercentage,
        lastActivityAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 7. Update or Create LeaderboardScore document
    await LeaderboardScore.findOneAndUpdate(
      { student: studentId },
      {
        student: studentId,
        totalScore,
        assignmentsScore,
        assessmentsScore,
        completedAssignments,
        completedAssessments,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[Progress Helper Error]', err);
  }
};

module.exports = {
  recordProgressEvent,
};
