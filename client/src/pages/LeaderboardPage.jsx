import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboardApi } from '../services/api';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await getLeaderboardApi();
        if (res.success) setLeaderboard(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-slate-500 font-medium">Loading leaderboard rankings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Leaderboard</h1>
        <p className="text-xs text-slate-500 mt-1">Overall score rankings across assignments and assessments</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Learning Center</th>
                <th className="py-2.5 px-3">Assignments Completed</th>
                <th className="py-2.5 px-3">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-3 text-center text-slate-500">
                    No student scores logged yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isCurrent = entry.student?._id === user?._id;
                  return (
                    <tr
                      key={entry._id}
                      className={
                        isCurrent
                          ? 'bg-indigo-50 font-bold text-indigo-950 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="py-3 px-3">#{entry.rank}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {entry.student?.name} {isCurrent && '(You)'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{entry.student?.centerName}</td>
                      <td className="py-3 px-3 text-slate-600">{entry.completedAssignments || 0}</td>
                      <td className="py-3 px-3 font-semibold text-indigo-600 text-sm">
                        {entry.totalScore} pts
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
