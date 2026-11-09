import axios from 'axios';

// Shared Axios instance with base URL (proxied to Spring Boot backend)
const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
  timeout: 8000,
});

// ==========================================
// Dashboard API
// ==========================================
export const fetchDashboard = () => api.get('/dashboard');

// ==========================================
// Student Management APIs
// ==========================================
export const fetchStudents = (search) => {
  const params = search ? { search } : {};
  return api.get('/students', { params });
};

export const fetchStudent = (id) => api.get(`/students/${id}`);

export const createStudent = (studentData) => api.post('/students', studentData);

export const updateStudent = (id, studentData) => api.put(`/students/${id}`, studentData);

export const deleteStudent = (id) => api.delete(`/students/${id}`);

// ==========================================
// Examination Marks APIs
// ==========================================
export const fetchMarks = (studentId) => api.get(`/students/${studentId}/marks`);

export const addMark = (studentId, markData) => api.post(`/students/${studentId}/marks`, markData);

export const updateMark = (markId, markData) => api.put(`/marks/${markId}`, markData);

export const deleteMark = (markId) => api.delete(`/marks/${markId}`);

export default api;
