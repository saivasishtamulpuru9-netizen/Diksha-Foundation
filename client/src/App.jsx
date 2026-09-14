import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HealthStatus from './components/HealthStatus';
import { ShieldCheck, Heart, Sparkles, Layers, Code, Server, Database } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JPMorgan Code for Good 2026 Solution</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          Diksha360 Platform
        </h1>
        <p className="text-lg text-slate-300">
          Centralized Holistic Child Development Tracking Ecosystem for Diksha Foundation
        </p>
      </div>

      {/* Health Verification Section */}
      <HealthStatus />

      {/* Phase 1 Architecture Overview */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/60 text-left hover:border-slate-600 transition-colors">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit mb-3">
            <Code className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Frontend Setup</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vite + React 18, Tailwind CSS, React Router v6, Axios API client, Recharts & Lucide React.
          </p>
        </div>

        <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/60 text-left hover:border-slate-600 transition-colors">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Backend Setup</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Express server with modular structure, CORS configuration, dotenv handling, and error middlewares.
          </p>
        </div>

        <div className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/60 text-left hover:border-slate-600 transition-colors">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg w-fit mb-3">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">MongoDB Structure</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mongoose connection layer with standard database configuration and connection handling.
          </p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-emerald-500/20">
                D360
              </div>
              <span className="font-bold text-lg text-white tracking-wide">
                Diksha<span className="text-emerald-400">360</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full">
                Phase 1 Foundation Ready
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Diksha Foundation x JPMorgan Code for Good. All rights reserved.</p>
            <p className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Holistic Child Empowerment
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
