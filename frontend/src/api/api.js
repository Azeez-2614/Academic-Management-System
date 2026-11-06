import axios from 'axios';
import { toast } from 'react-toastify';

const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

// Create configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000, // 10-second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sms_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: structured error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Determine user-friendly error message
    let errorMessage = 'An unexpected error occurred.';

    if (!error.response) {
      // Network disconnect or timeout
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out after 10 seconds. The server may be busy.';
      } else {
        errorMessage =
          'Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.';
      }
    } else {
      const { status, data } = error.response;

      if (data && typeof data === 'object') {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        } else if (data.errors && Array.isArray(data.errors)) {
          // Validation error list from backend
          errorMessage = data.errors.map((e) => e.defaultMessage || e.message || e).join('; ');
        }
      }

      switch (status) {
        case 400:
          // Bad Request / Validation Failure
          break;
        case 401:
          // Unauthorized: expired or invalid token
          localStorage.removeItem('sms_auth_token');
          localStorage.removeItem('sms_user');
          errorMessage = errorMessage || 'Your session has expired. Please log in again.';
          window.dispatchEvent(new CustomEvent('auth:expired'));
          break;
        case 403:
          errorMessage = 'Access denied: You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = errorMessage || 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = errorMessage || 'A record with these details already exists.';
          break;
        case 500:
          errorMessage = errorMessage || 'Internal Server Error. Please check server logs.';
          break;
        default:
          break;
      }
    }

    // Attach parsed message for callers to inspect
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

// ==========================================
// OPTIONAL MOCK MODE (Explicitly Opt-in Only)
// Only active when VITE_USE_MOCK=true
// ==========================================
const MOCK_STORAGE_KEY = 'sms_mock_students';
const INITIAL_MOCK_STUDENTS = [
  {
    id: 1,
    studentId: 'STU101',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@school.edu',
    phone: '+1 555-0101',
    className: 'Grade 10 - A',
    dateOfBirth: '2008-04-12',
    enrollmentDate: '2023-08-15',
    marks: [
      { id: 101, subject: 'Mathematics', marks: 88, totalMarks: 100, examType: 'Mid-Term' },
      { id: 102, subject: 'Physics', marks: 82, totalMarks: 100, examType: 'Mid-Term' },
      { id: 103, subject: 'Computer Science', marks: 95, totalMarks: 100, examType: 'Final' },
    ],
  },
  {
    id: 2,
    studentId: 'STU102',
    fullName: 'Priya Patel',
    email: 'priya.patel@school.edu',
    phone: '+1 555-0102',
    className: 'Grade 10 - A',
    dateOfBirth: '2008-07-25',
    enrollmentDate: '2023-08-15',
    marks: [
      { id: 201, subject: 'Mathematics', marks: 96, totalMarks: 100, examType: 'Mid-Term' },
      { id: 202, subject: 'Chemistry', marks: 91, totalMarks: 100, examType: 'Mid-Term' },
      { id: 203, subject: 'English', marks: 89, totalMarks: 100, examType: 'Final' },
    ],
  },
  {
    id: 3,
    studentId: 'STU103',
    fullName: 'Rohan Gupta',
    email: 'rohan.gupta@school.edu',
    phone: '+1 555-0103',
    className: 'Grade 11 - B',
    dateOfBirth: '2007-01-18',
    enrollmentDate: '2022-08-20',
    marks: [
      { id: 301, subject: 'Physics', marks: 62, totalMarks: 100, examType: 'Mid-Term' },
      { id: 302, subject: 'Mathematics', marks: 58, totalMarks: 100, examType: 'Mid-Term' },
    ],
  },
];

function getMockData() {
  const raw = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_STUDENTS));
    return INITIAL_MOCK_STUDENTS;
  }
  return JSON.parse(raw);
}

function saveMockData(data) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
}

// ==========================================
// API FUNCTIONS
// ==========================================

// Authentication
export const loginUser = async (credentials) => {
  if (isMockEnabled) {
    const fakeToken = 'mock_jwt_token_' + Date.now();
    const user = { username: credentials.username, role: 'ROLE_TEACHER', fullName: 'Demo Teacher' };
    localStorage.setItem('sms_auth_token', fakeToken);
    localStorage.setItem('sms_user', JSON.stringify(user));
    return { data: { token: fakeToken, user } };
  }
  const response = await api.post('/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('sms_auth_token', response.data.token);
    localStorage.setItem('sms_user', JSON.stringify(response.data.user || { username: credentials.username }));
  }
  return response;
};

export const registerTeacher = async (data) => {
  if (isMockEnabled) {
    return { data: { message: 'Teacher registered successfully (Mock Mode)' } };
  }
  return await api.post('/auth/register', data);
};

export const getCurrentUser = async () => {
  if (isMockEnabled) {
    const raw = localStorage.getItem('sms_user');
    return { data: raw ? JSON.parse(raw) : { username: 'teacher', role: 'ROLE_TEACHER' } };
  }
  return await api.get('/auth/me');
};

export const logoutUser = () => {
  localStorage.removeItem('sms_auth_token');
  localStorage.removeItem('sms_user');
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

// Dashboard
export const fetchDashboard = async () => {
  if (isMockEnabled) {
    const students = getMockData();
    let totalMarks = 0;
    let sumMarks = 0;
    let highest = null;
    let lowest = null;
    let maxPct = -1;
    let minPct = 101;

    const performanceSummary = students.map((s) => {
      const marks = s.marks || [];
      const obt = marks.reduce((acc, m) => acc + (Number(m.marks) || 0), 0);
      const tot = marks.reduce((acc, m) => acc + (Number(m.totalMarks) || 0), 0);
      const avg = tot > 0 ? (obt / tot) * 100 : null;

      if (avg != null) {
        totalMarks++;
        sumMarks += avg;
        if (avg > maxPct) {
          maxPct = avg;
          highest = { studentId: s.studentId, fullName: s.fullName, averagePercentage: avg };
        }
        if (avg < minPct) {
          minPct = avg;
          lowest = { studentId: s.studentId, fullName: s.fullName, averagePercentage: avg };
        }
      }

      let grade = 'N/A';
      if (avg != null) {
        if (avg >= 90) grade = 'A+';
        else if (avg >= 80) grade = 'A';
        else if (avg >= 70) grade = 'B+';
        else if (avg >= 60) grade = 'B';
        else if (avg >= 50) grade = 'C';
        else if (avg >= 40) grade = 'D';
        else grade = 'F';
      }

      return {
        id: s.id,
        studentId: s.studentId,
        fullName: s.fullName,
        className: s.className,
        averagePercentage: avg,
        grade,
      };
    });

    return {
      data: {
        totalStudents: students.length,
        averagePercentage: totalMarks > 0 ? sumMarks / totalMarks : 0,
        highestScorer: highest,
        lowestScorer: lowest,
        performanceSummary,
      },
    };
  }

  return await api.get('/dashboard');
};

// Students CRUD & Search/Filter/Pagination
export const fetchStudents = async (params = {}) => {
  if (isMockEnabled) {
    let list = getMockData();
    const { search, className, performance, sortBy, sortDir } = params;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          (s.fullName && s.fullName.toLowerCase().includes(q)) ||
          (s.studentId && s.studentId.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q))
      );
    }
    if (className && className !== 'all') {
      list = list.filter((s) => s.className?.toLowerCase() === className.toLowerCase());
    }
    if (performance && performance !== 'all') {
      list = list.filter((s) => {
        const marks = s.marks || [];
        const obt = marks.reduce((acc, m) => acc + (Number(m.marks) || 0), 0);
        const tot = marks.reduce((acc, m) => acc + (Number(m.totalMarks) || 0), 0);
        const avg = tot > 0 ? (obt / tot) * 100 : 0;
        if (performance === 'distinction') return avg >= 75;
        if (performance === 'average') return avg >= 40 && avg < 75;
        if (performance === 'low') return avg < 40 && avg > 0;
        return true;
      });
    }
    if (sortBy) {
      const isAsc = sortDir === 'asc';
      list.sort((a, b) => {
        if (sortBy === 'name') {
          return isAsc ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName);
        }
        if (sortBy === 'studentId') {
          return isAsc ? a.studentId.localeCompare(b.studentId) : b.studentId.localeCompare(a.studentId);
        }
        return 0;
      });
    }

    return {
      data: {
        content: list,
        totalElements: list.length,
        totalPages: 1,
        size: list.length,
        number: 0,
      },
    };
  }

  return await api.get('/students', { params });
};

export const fetchStudent = async (id) => {
  if (isMockEnabled) {
    const list = getMockData();
    const found = list.find((s) => String(s.id) === String(id));
    if (!found) {
      const err = new Error('Student not found');
      err.response = { status: 404, data: { message: 'Student not found with id: ' + id } };
      throw err;
    }
    return { data: found };
  }
  return await api.get(`/students/${id}`);
};

export const createStudent = async (data) => {
  if (isMockEnabled) {
    const list = getMockData();
    if (list.some((s) => s.studentId === data.studentId)) {
      const err = new Error('Duplicate student ID');
      err.response = { status: 400, data: { message: `Student ID ${data.studentId} is already in use` } };
      throw err;
    }
    const created = { ...data, id: Date.now(), marks: [] };
    list.push(created);
    saveMockData(list);
    return { data: created };
  }
  return await api.post('/students', data);
};

export const updateStudent = async (id, data) => {
  if (isMockEnabled) {
    const list = getMockData();
    const idx = list.findIndex((s) => String(s.id) === String(id));
    if (idx === -1) {
      const err = new Error('Student not found');
      err.response = { status: 404, data: { message: 'Student not found with id: ' + id } };
      throw err;
    }
    list[idx] = { ...list[idx], ...data };
    saveMockData(list);
    return { data: list[idx] };
  }
  return await api.put(`/students/${id}`, data);
};

export const deleteStudent = async (id) => {
  if (isMockEnabled) {
    let list = getMockData();
    list = list.filter((s) => String(s.id) !== String(id));
    saveMockData(list);
    return { data: { message: 'Student deleted successfully' } };
  }
  return await api.delete(`/students/${id}`);
};

// Marks CRUD
export const fetchMarks = async (studentId) => {
  if (isMockEnabled) {
    const list = getMockData();
    const student = list.find((s) => String(s.id) === String(studentId));
    return { data: student?.marks || [] };
  }
  return await api.get(`/students/${studentId}/marks`);
};

export const addMark = async (studentId, data) => {
  if (isMockEnabled) {
    const list = getMockData();
    const student = list.find((s) => String(s.id) === String(studentId));
    if (!student) {
      const err = new Error('Student not found');
      err.response = { status: 404, data: { message: 'Student not found' } };
      throw err;
    }
    const newMark = { ...data, id: Date.now() };
    if (!student.marks) student.marks = [];
    student.marks.push(newMark);
    saveMockData(list);
    return { data: newMark };
  }
  return await api.post(`/students/${studentId}/marks`, data);
};

export const updateMark = async (markId, data) => {
  if (isMockEnabled) {
    const list = getMockData();
    for (const student of list) {
      if (student.marks) {
        const idx = student.marks.findIndex((m) => String(m.id) === String(markId));
        if (idx !== -1) {
          student.marks[idx] = { ...student.marks[idx], ...data };
          saveMockData(list);
          return { data: student.marks[idx] };
        }
      }
    }
    const err = new Error('Mark record not found');
    err.response = { status: 404, data: { message: 'Mark record not found with id: ' + markId } };
    throw err;
  }
  return await api.put(`/marks/${markId}`, data);
};

export const deleteMark = async (markId) => {
  if (isMockEnabled) {
    const list = getMockData();
    for (const student of list) {
      if (student.marks) {
        student.marks = student.marks.filter((m) => String(m.id) !== String(markId));
      }
    }
    saveMockData(list);
    return { data: { message: 'Mark record deleted successfully' } };
  }
  return await api.delete(`/marks/${markId}`);
};

export default api;
