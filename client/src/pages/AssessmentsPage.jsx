import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAssessmentsApi,
  createAssessmentApi,
  submitAssessmentApi,
} from '../services/api';

const AssessmentsPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role?.toLowerCase() === 'teacher' || user?.role?.toLowerCase() === 'admin';
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active quiz state (Student)
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizScoreResult, setQuizScoreResult] = useState(null);

  // Create Assessment state (Teacher)
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correct, setCorrect] = useState('');
  const [questionsList, setQuestionsList] = useState([]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await getAssessmentsApi();
      if (res.success) setAssessments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleAddQuestion = () => {
    if (!qText || !correct) {
      alert('Please provide a question and the correct answer.');
      return;
    }
    const options = [optA, optB, optC, optD].filter((o) => o.trim() !== '');
    setQuestionsList([
      ...questionsList,
      {
        question: qText,
        options,
        correctAnswer: correct,
        marks: 10,
      },
    ]);
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrect('');
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!newTitle || questionsList.length === 0) {
      alert('Please provide a title and at least one question.');
      return;
    }

    try {
      const res = await createAssessmentApi({
        title: newTitle,
        description: newDesc,
        durationMinutes: 15,
        status: 'published',
        questions: questionsList,
      });
      if (res.success) {
        setShowCreate(false);
        setNewTitle('');
        setNewDesc('');
        setQuestionsList([]);
        fetchAssessments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assessment.');
    }
  };

  const handleOptionSelect = (questionIndex, selectedValue) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: selectedValue,
    });
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;

    setSubmittingQuiz(true);
    try {
      const formattedAnswers = Object.keys(userAnswers).map((idx) => ({
        questionIndex: Number(idx),
        answer: userAnswers[idx],
      }));

      const res = await submitAssessmentApi(activeQuiz._id, { answers: formattedAnswers });
      if (res.success) {
        setQuizScoreResult({
          score: res.data.score,
          totalMarks: activeQuiz.totalMarks || (activeQuiz.questions ? activeQuiz.questions.length * 10 : 0),
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Quiz submission failed.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 font-medium">Loading assessments...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments & Quizzes</h1>
          <p className="text-xs text-slate-500 mt-1">Interactive evaluations and knowledge checks</p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-sm"
          >
            + Create Assessment
          </button>
        )}
      </div>

      {/* Assessments List Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-2.5 px-3">Assessment Title</th>
                <th className="py-2.5 px-3">Questions</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Total Marks</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 px-3 text-center text-slate-500">
                    No assessments available.
                  </td>
                </tr>
              ) : (
                assessments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{item.title}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.questions ? item.questions.length : 0} Questions
                    </td>
                    <td className="py-3 px-3 text-slate-500">{item.durationMinutes || 15} mins</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.totalMarks || 0}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {!isTeacher ? (
                        <button
                          onClick={() => {
                            setActiveQuiz(item);
                            setUserAnswers({});
                            setQuizScoreResult(null);
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded"
                        >
                          Start Assessment
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Active</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Modal / View */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-slate-200 text-left my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{activeQuiz.title}</h3>
                <p className="text-xs text-slate-500">Duration: {activeQuiz.durationMinutes || 15} mins | Total Marks: {activeQuiz.totalMarks}</p>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {quizScoreResult ? (
              <div className="py-6 text-center space-y-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="text-xl font-bold text-emerald-900">Assessment Submitted!</h4>
                <p className="text-2xl font-extrabold text-emerald-600">
                  Score: {quizScoreResult.score} / {quizScoreResult.totalMarks}
                </p>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-5 py-2 bg-emerald-700 text-white text-xs font-semibold rounded hover:bg-emerald-800"
                >
                  Close Quiz
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuiz} className="space-y-6">
                {activeQuiz.questions && activeQuiz.questions.length > 0 ? (
                  activeQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <p className="font-semibold text-slate-900 text-sm">
                        Question {qIdx + 1}: {q.question}
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {q.options && q.options.length > 0 ? (
                          q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className="flex items-center space-x-2 text-xs text-slate-700 p-2 rounded hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`q_${qIdx}`}
                                value={opt}
                                checked={userAnswers[qIdx] === opt}
                                onChange={() => handleOptionSelect(qIdx, opt)}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{opt}</span>
                            </label>
                          ))
                        ) : (
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            value={userAnswers[qIdx] || ''}
                            onChange={(e) => handleOptionSelect(qIdx, e.target.value)}
                            className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">No questions found in this assessment.</p>
                )}

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuiz}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                  >
                    {submittingQuiz ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Assessment Modal (Teacher) */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Assessment</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Science Quiz #1"
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description"
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>

              {/* Add Question Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <p className="font-semibold text-slate-900">Add Question to Quiz</p>
                <input
                  type="text"
                  placeholder="Question text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Option A"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Exact Correct Answer"
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1 bg-slate-800 text-white font-medium rounded"
                >
                  + Add Question ({questionsList.length} Added)
                </button>
              </div>

              {questionsList.length > 0 && (
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">Questions List:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                    {questionsList.map((q, idx) => (
                      <li key={idx}>
                        {q.question} (Answer: {q.correctAnswer})
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentsPage;
