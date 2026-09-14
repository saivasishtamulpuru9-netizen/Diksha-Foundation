import React, { useEffect, useState } from 'react';
import { getHealthCheck } from '../services/api';
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Server, Globe } from 'lucide-react';

const HealthStatus = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHealthCheck();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Failed to reach API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Health Verification</h2>
            <p className="text-xs text-slate-400">Phase 1 Architecture Check</p>
          </div>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-all border border-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">Client App (Vite React)</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Running (Port 5173)
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">API Health Endpoint (/api/health)</span>
          </div>
          {loading ? (
            <span className="text-xs text-slate-400 animate-pulse">Checking status...</span>
          ) : error ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline / Error</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>200 OK</span>
            </span>
          )}
        </div>

        {health && (
          <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-left">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Backend Response Payload</p>
            <pre className="text-sm font-mono text-emerald-300 bg-slate-950/80 p-3 rounded-lg overflow-x-auto border border-slate-800">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-950/30 rounded-xl border border-rose-500/20 text-left">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">Diagnostic Error Message</p>
            <p className="text-sm text-rose-300 font-mono">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthStatus;
