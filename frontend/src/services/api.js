import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Resume APIs
export const resumeService = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getResumes: () => api.get('/resumes'),
  getResume: (resumeId) => api.get(`/resumes/${resumeId}`),
  deleteResume: (resumeId) => api.delete(`/resumes/${resumeId}`)
};

// Interview APIs
export const interviewService = {
  generateQuestions: (data) => api.post('/interviews/generate-questions', data),
  getInterview: (interviewId) => api.get(`/interviews/${interviewId}`),
  getUserInterviews: () => api.get('/interviews'),
  submitAnswer: (data) => api.post('/interviews/submit-answer', data),
  completeInterview: (data) => api.post('/interviews/complete', data)
};

// Evaluation APIs
export const evaluationService = {
  evaluateAnswer: (data) => api.post('/evaluations/evaluate-answer', data),
  generateFeedback: (data) => api.post('/evaluations/generate-feedback', data),
  getFeedback: (interviewId) => api.get(`/evaluations/${interviewId}`)
};

export default api;
