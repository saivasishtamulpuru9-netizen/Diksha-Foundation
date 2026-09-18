import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role ? user.role.toLowerCase() : '';
    const hasRole = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

    if (!hasRole) {
      return (
        <div className="max-w-md mx-auto my-12 p-6 bg-slate-800/90 rounded-2xl border border-rose-500/30 text-center shadow-xl">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Forbidden</h2>
          <p className="text-sm text-slate-300 mb-4">
            Your role (<span className="font-semibold text-amber-400 uppercase">{user?.role}</span>) does not have permission to view this resource.
          </p>
          <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-700">
            Allowed roles for this view: {allowedRoles.join(', ')}
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
