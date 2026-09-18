import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTeacherDashboardApi, gradeSubmissionApi } from '../services/api';

const SubmissionsPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [marks, setMarks] = useState(100);
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getTeacherDashboardApi();
      if (res.success && res.data.recentSubmissions) {
        setSubmissions(res.data.recentSubmissions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    setGrading(true);
    try {
      const res = await gradeSubmissionApi(selectedSub._id, {
        marks: Number(marks),
        feedback,
      });
      if (res.success) {
        setSelectedSub(null);
        setFeedback('');
        fetchSubmissions();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Grading failed.');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 font-medium">Loading submissions...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Submissions</h1>
        <p className="text-xs text-slate-500 mt-1">Review and grade submitted coursework</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Assignment</th>
                <th className="py-2.5 px-3">Submitted</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-3 text-center text-slate-500">
                    No submissions available to review.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
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
                        onClick={() => setSelectedSub(sub)}
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

      {/* Grade Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Submit Grade</h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
              <p><span className="font-semibold">Student Name:</span> {selectedSub.student?.name}</p>
              <p><span className="font-semibold">Assignment:</span> {selectedSub.assignment?.title}</p>
              <p><span className="font-semibold">Submitted Content:</span></p>
              <div className="p-2 bg-white border border-slate-200 rounded font-mono text-slate-800">
                {selectedSub.content || 'No text submitted.'}
              </div>
            </div>

            <form onSubmit={handleGrade} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marks [0 - 100]</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback</label>
                <textarea
                  rows="3"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter comments or constructive feedback..."
                  className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
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

export default SubmissionsPage;
