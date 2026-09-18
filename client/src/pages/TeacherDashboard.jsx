import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTeacherDashboardApi,
  getAssignmentsApi,
  createAssignmentApi,
  gradeSubmissionApi,
} from '../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Assignment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    course: 'Mathematics',
    dueDate: '',
    maxMarks: 100,
  });
  const [creating, setCreating] = useState(false);

  // Grade Submission Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeMarks, setGradeMarks] = useState(100);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, assignRes] = await Promise.all([
        getTeacherDashboardApi(),
        getAssignmentsApi(),
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (assignRes.success) setAssignments(assignRes.data);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
      setError('Failed to load teacher dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title) return;

    setCreating(true);
    try {
      const res = await createAssignmentApi(newAssignment);
      if (res.success) {
        setShowCreateModal(false);
        setNewAssignment({
          title: '',
          description: '',
          instructions: '',
          course: 'Mathematics',
          dueDate: '',
          maxMarks: 100,
        });
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setGrading(true);
    try {
      const res = await gradeSubmissionApi(selectedSubmission._id, {
        marks: Number(gradeMarks),
        feedback: gradeFeedback,
      });
      if (res.success) {
        setSelectedSubmission(null);
        setGradeFeedback('');
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade submission.');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading teacher dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name || 'Teacher/Volunteer'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Center: <span className="font-semibold text-slate-800">{user?.centerName || 'Diksha Patna Center'}</span>
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
        >
          + Create Assignment
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {dashboardData?.totalAssignments || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submissions</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {dashboardData?.totalSubmissions || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {dashboardData?.totalAssessments || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {dashboardData?.totalStudents || 0}
          </p>
        </div>
      </div>

      {/* My Assignments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          MY ASSIGNMENTS
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Max Marks</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-3 text-center text-slate-500">
                    No assignments created yet. Click "+ Create Assignment" above.
                  </td>
                </tr>
              ) : (
                assignments.map((assign) => (
                  <tr key={assign._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{assign.title}</td>
                    <td className="py-3 px-3 text-slate-600">{assign.course || 'General'}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{assign.maxMarks || 100}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {assign.status || 'published'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          RECENT SUBMISSIONS FOR REVIEW
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Assignment</th>
                <th className="py-2.5 px-3">Submitted Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {!dashboardData?.recentSubmissions || dashboardData.recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-3 text-center text-slate-500">
                    No recent submissions to review.
                  </td>
                </tr>
              ) : (
                dashboardData.recentSubmissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{sub.student?.name}</td>
                    <td className="py-3 px-3 text-slate-600">{sub.assignment?.title}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          sub.status === 'graded'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded"
                      >
                        Grade
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Assignment */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create New Assignment</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g. Science Chapter 3 Worksheet"
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                  <input
                    type="text"
                    value={newAssignment.course}
                    onChange={(e) => setNewAssignment({ ...newAssignment, course: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: Number(e.target.value) })}
                    className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Brief description of the assignment"
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows="2"
                  value={newAssignment.instructions}
                  onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                  placeholder="Detailed instructions for students"
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grade Submission */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Grade Student Submission</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
              <p><span className="font-semibold">Student:</span> {selectedSubmission.student?.name}</p>
              <p><span className="font-semibold">Assignment:</span> {selectedSubmission.assignment?.title}</p>
              <p><span className="font-semibold">Submitted Solution:</span></p>
              <p className="bg-white p-2 border border-slate-200 rounded font-mono text-slate-800">
                {selectedSubmission.content || 'No text content provided.'}
              </p>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marks (Out of 100)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback</label>
                <textarea
                  rows="3"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Enter comments or constructive feedback..."
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {grading ? 'Submitting Grade...' : 'Submit Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
