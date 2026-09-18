import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to headers automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('diksha_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Health check endpoint
export const getHealthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Auth API Methods
export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Dashboard APIs
export const getStudentDashboardApi = async () => {
  const response = await api.get('/student/dashboard');
  return response.data;
};

export const getTeacherDashboardApi = async () => {
  const response = await api.get('/teacher/dashboard');
  return response.data;
};

// Assignment APIs
export const getAssignmentsApi = async () => {
  const response = await api.get('/assignments');
  return response.data;
};

export const getAssignmentByIdApi = async (id) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

export const createAssignmentApi = async (assignmentData) => {
  const response = await api.post('/assignments', assignmentData);
  return response.data;
};

export const updateAssignmentApi = async (id, assignmentData) => {
  const response = await api.put(`/assignments/${id}`, assignmentData);
  return response.data;
};

export const deleteAssignmentApi = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};

export const submitAssignmentApi = async (id, submissionData) => {
  const response = await api.post(`/assignments/${id}/submit`, submissionData);
  return response.data;
};

export const getAssignmentSubmissionsApi = async (id) => {
  const response = await api.get(`/assignments/${id}/submissions`);
  return response.data;
};

// Submission APIs
export const getMySubmissionsApi = async () => {
  const response = await api.get('/submissions/my');
  return response.data;
};

export const gradeSubmissionApi = async (id, gradeData) => {
  const response = await api.put(`/submissions/${id}/grade`, gradeData);
  return response.data;
};

// Assessment APIs
export const getAssessmentsApi = async () => {
  const response = await api.get('/assessments');
  return response.data;
};

export const getAssessmentByIdApi = async (id) => {
  const response = await api.get(`/assessments/${id}`);
  return response.data;
};

export const createAssessmentApi = async (assessmentData) => {
  const response = await api.post('/assessments', assessmentData);
  return response.data;
};

export const submitAssessmentApi = async (id, answersData) => {
  const response = await api.post(`/assessments/${id}/submit`, answersData);
  return response.data;
};

export const getMyAssessmentSubmissionsApi = async () => {
  const response = await api.get('/assessments/my-submissions');
  return response.data;
};

// Progress API
export const getProgressMeApi = async () => {
  const response = await api.get('/progress/me');
  return response.data;
};

// Leaderboard API
export const getLeaderboardApi = async () => {
  const response = await api.get('/leaderboard');
  return response.data;
};

export default api;
