import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const DashboardShell = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  if (role === 'teacher' || role === 'admin') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
};

export default DashboardShell;
