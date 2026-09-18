import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  // Quick preset login for judge demo evaluation
  const handleQuickLogin = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLocalError('');
    try {
      await login(demoEmail, 'password123');
      navigate('/dashboard');
    } catch (err) {
      try {
        await register({
          name: `Demo ${demoRole}`,
          email: demoEmail,
          password: 'password123',
          role: demoRole.toLowerCase(),
          centerName: 'Diksha Patna Center',
        });
        navigate('/dashboard');
      } catch (regErr) {
        setLocalError(`Demo login error: ${regErr.message}`);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm text-left">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Sign In to Diksha360</h2>
        <p className="text-xs text-slate-500 mt-1">Holistic Child Empowerment Platform</p>
      </div>

      {/* Quick Demo Login Presets */}
      <div className="mb-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs font-semibold text-slate-700 mb-2">Quick Demo Login Presets:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@diksha.org', 'Admin')}
            className="py-1 px-2 bg-white hover:bg-slate-100 text-xs font-semibold text-indigo-700 border border-slate-300 rounded text-center"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('teacher@diksha.org', 'Teacher')}
            className="py-1 px-2 bg-white hover:bg-slate-100 text-xs font-semibold text-indigo-700 border border-slate-300 rounded text-center"
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('student@diksha.org', 'Student')}
            className="py-1 px-2 bg-white hover:bg-slate-100 text-xs font-semibold text-emerald-700 border border-slate-300 rounded text-center"
          >
            Student
          </button>
        </div>
      </div>

      {localError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@diksha.org"
            className="w-full p-2.5 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2.5 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default Login;
