import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardShell from './pages/DashboardShell';
import AssignmentsPage from './pages/AssignmentsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ProgressPage from './pages/ProgressPage';
import LeaderboardPage from './pages/LeaderboardPage';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role?.toLowerCase();
  const isTeacher = role === 'teacher' || role === 'admin';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 font-bold text-slate-900 text-lg">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-sm font-black">D360</span>
            <span>Diksha<span className="text-indigo-600">360</span></span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-4 text-xs font-semibold text-slate-600">
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/assignments" className="hover:text-indigo-600 transition-colors">
                Assignments
              </Link>
              <Link to="/assessments" className="hover:text-indigo-600 transition-colors">
                Assessments
              </Link>

              {isTeacher ? (
                <Link to="/submissions" className="hover:text-indigo-600 transition-colors">
                  Submissions
                </Link>
              ) : (
                <>
                  <Link to="/progress" className="hover:text-indigo-600 transition-colors">
                    Progress
                  </Link>
                  <Link to="/leaderboard" className="hover:text-indigo-600 transition-colors">
                    Leaderboard
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 text-xs">
              <span className="hidden sm:inline-block font-semibold text-slate-700">
                {user?.name} <span className="text-slate-400 font-normal">({role?.toUpperCase()})</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs">
              <Link
                to="/login"
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
        Diksha Foundation Educational Ecosystem
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Diksha360 Educational Management Portal
      </h1>
      <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
        A simple, clean holistic child development platform supporting academic coursework, assessment evaluations, and learning progress tracking.
      </p>

      <div className="flex justify-center space-x-4 pt-2">
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded shadow-sm"
          >
            Go to Dashboard ({user?.role?.toUpperCase()}) →
          </Link>
        ) : (
          <div className="flex space-x-3">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded shadow-sm"
            >
              Sign In to Access Dashboard →
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded shadow-sm"
            >
              Register Account
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left text-xs">
        <div className="p-4 bg-white rounded border border-slate-200 space-y-1">
          <p className="font-bold text-slate-900">Academic Assignments</p>
          <p className="text-slate-500">Teachers publish course assignments; students submit text/file solutions for grading.</p>
        </div>
        <div className="p-4 bg-white rounded border border-slate-200 space-y-1">
          <p className="font-bold text-slate-900">Quizzes & Assessments</p>
          <p className="text-slate-500">Automated multiple-choice evaluations with instant score calculation and answer review.</p>
        </div>
        <div className="p-4 bg-white rounded border border-slate-200 space-y-1">
          <p className="font-bold text-slate-900">Progress & Leaderboard</p>
          <p className="text-slate-500">Transparent progress tracking, activity logs, and center-wide student score rankings.</p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
          <Navbar />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardShell />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <AssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submissions"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <SubmissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessments"
                element={
                  <ProtectedRoute>
                    <AssessmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <LeaderboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
            © 2026 Diksha Foundation Platform. All rights reserved.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
