import React, { useEffect, useState } from 'react';
import { getProgressMeApi } from '../services/api';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const res = await getProgressMeApi();
        if (res.success) setProgressData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-slate-500 font-medium">Loading progress details...</div>;
  }

  const progress = progressData?.progress || {};
  const recentEvents = progressData?.recentEvents || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Learning Progress</h1>
        <p className="text-xs text-slate-500 mt-1">Holistic child development metrics & achievement log</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Overall Progress</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{progress.completionPercentage || 0}%</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Assignments</p>
          <p className="text-lg font-bold text-slate-800 mt-1">
            {progress.assignmentsCompleted || 0} / {progress.totalAssignments || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Assessments</p>
          <p className="text-lg font-bold text-slate-800 mt-1">
            {progress.assessmentsCompleted || 0} / {progress.totalAssessments || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Average Score</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{progress.averageScore || 0} pts</p>
        </div>
      </div>

      {/* Detailed Progress Bars */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">COMPLETION STATUS</h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Assignments Completion ({progress.assignmentsCompleted}/{progress.totalAssignments})</span>
              <span>
                {progress.totalAssignments > 0
                  ? Math.round((progress.assignmentsCompleted / progress.totalAssignments) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-3 rounded-full"
                style={{
                  width: `${
                    progress.totalAssignments > 0
                      ? Math.round((progress.assignmentsCompleted / progress.totalAssignments) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Assessments Completion ({progress.assessmentsCompleted}/{progress.totalAssessments})</span>
              <span>
                {progress.totalAssessments > 0
                  ? Math.round((progress.assessmentsCompleted / progress.totalAssessments) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-3 rounded-full"
                style={{
                  width: `${
                    progress.totalAssessments > 0
                      ? Math.round((progress.assessmentsCompleted / progress.totalAssessments) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">RECENT ACTIVITY LOG</h2>
        {recentEvents.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No activity logged yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {recentEvents.map((evt) => (
              <li key={evt._id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{evt.description}</span>
                  {evt.score > 0 && <span className="ml-2 text-indigo-600 font-bold">({evt.score} pts)</span>}
                </div>
                <span className="text-slate-400 text-xs">{new Date(evt.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
