import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStudentDashboardApi,
  getAssignmentsApi,
  getProgressMeApi,
  getLeaderboardApi,
  submitAssignmentApi,
} from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected assignment modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, assignRes, progRes, leadRes] = await Promise.all([
        getStudentDashboardApi(),
        getAssignmentsApi(),
        getProgressMeApi(),
        getLeaderboardApi(),
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (assignRes.success) setAssignments(assignRes.data);
      if (progRes.success) setProgressData(progRes.data);
      if (leadRes.success) setLeaderboard(leadRes.data);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionText.trim()) return;

    setSubmitting(true);
    setSubmitMessage('');
    try {
      const res = await submitAssignmentApi(selectedAssignment._id, {
        content: submissionText,
      });
      if (res.success) {
        setSubmitMessage('Assignment submitted successfully!');
        setSubmissionText('');
        setTimeout(() => {
          setSelectedAssignment(null);
          setSubmitMessage('');
          loadData();
        }, 1500);
      }
    } catch (err) {
      setSubmitMessage(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading dashboard data...
      </div>
    );
  }

  const progress = progressData?.progress || {};
  const recentEvents = progressData?.recentEvents || [];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Welcome Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user?.name || 'Student'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Diksha Foundation Learning Center: <span className="font-semibold text-slate-800">{user?.centerName || 'Main Center'}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Small Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {dashboardData?.submissionsCount || 0} / {dashboardData?.assignmentsCount || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {dashboardData?.assessmentSubmissionsCount || 0} / {dashboardData?.assessmentsCount || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {progress.averageScore || 0} pts
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {progress.completionPercentage || 0}%
          </p>
        </div>
      </div>

      {/* My Assignments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">MY ASSIGNMENTS</h2>
          <Link to="/assignments" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">Assignment</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Max Marks</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 px-3 text-center text-slate-500 text-xs">
                    No active assignments found.
                  </td>
                </tr>
              ) : (
                assignments.slice(0, 5).map((assign) => (
                  <tr key={assign._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-medium text-slate-900">{assign.title}</td>
                    <td className="py-3 px-3 text-slate-600 text-xs">{assign.course || 'General'}</td>
                    <td className="py-3 px-3 text-slate-600 text-xs">
                      {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-700 text-xs">{assign.maxMarks || 100}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {assign.status || 'Published'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setSelectedAssignment(assign)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors"
                      >
                        View / Submit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">MY PROGRESS</h2>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Assignment Progress ({dashboardData?.submissionsCount || 0}/{dashboardData?.assignmentsCount || 0})</span>
              <span>
                {dashboardData?.assignmentsCount > 0
                  ? Math.round((dashboardData.submissionsCount / dashboardData.assignmentsCount) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    dashboardData?.assignmentsCount > 0
                      ? Math.round((dashboardData.submissionsCount / dashboardData.assignmentsCount) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Assessment Progress ({dashboardData?.assessmentSubmissionsCount || 0}/{dashboardData?.assessmentsCount || 0})</span>
              <span>
                {dashboardData?.assessmentsCount > 0
                  ? Math.round((dashboardData.assessmentSubmissionsCount / dashboardData.assessmentsCount) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    dashboardData?.assessmentsCount > 0
                      ? Math.round((dashboardData.assessmentSubmissionsCount / dashboardData.assessmentsCount) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Overall Completion</span>
              <span className="font-bold text-emerald-600">{progress.completionPercentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.completionPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">RECENT ACTIVITY</h2>
        {recentEvents.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {recentEvents.map((evt) => (
              <li key={evt._id} className="py-2.5 flex items-center justify-between">
                <span className="text-slate-800 font-medium">{evt.description}</span>
                <span className="text-slate-400 text-xs">
                  {new Date(evt.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">LEADERBOARD</h2>
          <Link to="/leaderboard" className="text-xs font-semibold text-indigo-600 hover:underline">
            Full Board →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">Student</th>
                <th className="py-2 px-3">Center</th>
                <th className="py-2 px-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-3 px-3 text-center text-slate-500">
                    No leaderboard scores logged yet.
                  </td>
                </tr>
              ) : (
                leaderboard.slice(0, 5).map((entry) => {
                  const isCurrent = entry.student?._id === user?._id;
                  return (
                    <tr
                      key={entry._id}
                      className={isCurrent ? 'bg-indigo-50 font-bold text-indigo-950' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2.5 px-3">#{entry.rank}</td>
                      <td className="py-2.5 px-3">{entry.student?.name} {isCurrent && '(You)'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{entry.student?.centerName}</td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-600">{entry.totalScore} pts</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Submitting Assignment */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedAssignment.title}</h3>
                <p className="text-xs text-slate-500">Course: {selectedAssignment.course || 'General'} | Max Marks: {selectedAssignment.maxMarks}</p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {selectedAssignment.instructions && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block mb-1">Instructions:</span>
                {selectedAssignment.instructions}
              </div>
            )}

            {submitMessage && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded">
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmitAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Text / Solution
                </label>
                <textarea
                  required
                  rows="4"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your solution response or answers here..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
