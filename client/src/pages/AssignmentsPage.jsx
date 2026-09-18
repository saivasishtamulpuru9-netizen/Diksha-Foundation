import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAssignmentsApi,
  createAssignmentApi,
  submitAssignmentApi,
} from '../services/api';

const AssignmentsPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role?.toLowerCase() === 'teacher' || user?.role?.toLowerCase() === 'admin';
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  // Create Modal State (for Teachers)
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    course: 'Mathematics',
    dueDate: '',
    maxMarks: 100,
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await getAssignmentsApi();
      if (res.success) setAssignments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createAssignmentApi(formData);
      if (res.success) {
        setShowCreate(false);
        setFormData({ title: '', description: '', instructions: '', course: 'Mathematics', dueDate: '', maxMarks: 100 });
        fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionContent.trim()) return;

    try {
      const res = await submitAssignmentApi(selectedAssignment._id, { content: submissionContent });
      if (res.success) {
        setSubmitMsg('Assignment submitted successfully.');
        setSubmissionContent('');
        setTimeout(() => {
          setSelectedAssignment(null);
          setSubmitMsg('');
        }, 1500);
      }
    } catch (err) {
      setSubmitMsg(err.response?.data?.message || 'Submission failed.');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 font-medium">Loading assignments...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-xs text-slate-500 mt-1">Course Work & Learning Tasks</p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-sm"
          >
            + Create Assignment
          </button>
        )}
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">Assignment Name</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Maximum Marks</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 px-3 text-center text-slate-500">
                    No assignments available.
                  </td>
                </tr>
              ) : (
                assignments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{item.title}</td>
                    <td className="py-3 px-3 text-slate-600">{item.course || 'General'}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.maxMarks || 100}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setSelectedAssignment(item)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded"
                      >
                        {isTeacher ? 'View Details' : 'View / Submit'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Detail & Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedAssignment.title}</h3>
                <p className="text-xs text-slate-500">
                  Course: {selectedAssignment.course} | Max Marks: {selectedAssignment.maxMarks}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {selectedAssignment.description && (
              <div className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block">Description:</span>
                {selectedAssignment.description}
              </div>
            )}

            {selectedAssignment.instructions && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block mb-1">Instructions:</span>
                {selectedAssignment.instructions}
              </div>
            )}

            {submitMsg && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded">
                {submitMsg}
              </div>
            )}

            {!isTeacher && (
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Submission Text
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Enter your completed assignment solutions here..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded"
                  >
                    Submit Assignment
                  </button>
                </div>
              </form>
            )}

            {isTeacher && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Assignment</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Algebra Homework #2"
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                    className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows="2"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
