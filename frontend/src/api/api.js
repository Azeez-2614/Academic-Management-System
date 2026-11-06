import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 3000,
});

// Seed data used when backend is offline
const INITIAL_STUDENTS = [
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
  {
    id: 4,
    studentId: 'STU104',
    fullName: 'Ananya Verma',
    email: 'ananya.v@school.edu',
    phone: '+1 555-0104',
    className: 'Grade 11 - B',
    dateOfBirth: '2007-11-03',
    enrollmentDate: '2022-08-20',
    marks: [
      { id: 401, subject: 'Chemistry', marks: 74, totalMarks: 100, examType: 'Mid-Term' },
      { id: 402, subject: 'Biology', marks: 78, totalMarks: 100, examType: 'Final' },
    ],
  },
  {
    id: 5,
    studentId: 'STU105',
    fullName: 'Vikram Malhotra',
    email: 'vikram.m@school.edu',
    phone: '+1 555-0105',
    className: 'Grade 12 - Science',
    dateOfBirth: '2006-09-14',
    enrollmentDate: '2021-08-10',
    marks: [
      { id: 501, subject: 'Physics', marks: 48, totalMarks: 100, examType: 'Mid-Term' },
      { id: 502, subject: 'Mathematics', marks: 52, totalMarks: 100, examType: 'Final' },
    ],
  },
];

// Helper to access persistent local fallback store
function getLocalStudents() {
  const data = localStorage.getItem('sms_students');
  if (!data) {
    localStorage.setItem('sms_students', JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  return JSON.parse(data);
}

function saveLocalStudents(list) {
  localStorage.setItem('sms_students', JSON.stringify(list));
}

// Fallback calculations for Dashboard
function computeLocalDashboard() {
  const students = getLocalStudents();
  let totalMarksCount = 0;
  let totalPercentageSum = 0;

  let highest = null;
  let lowest = null;
  let maxPct = -1;
  let minPct = 101;

  const performanceSummary = students.map((s) => {
    let obtained = 0;
    let total = 0;
    (s.marks || []).forEach((m) => {
      obtained += Number(m.marks) || 0;
      total += Number(m.totalMarks) || 0;
      if (m.totalMarks > 0) {
        totalMarksCount++;
        totalPercentageSum += (m.marks / m.totalMarks) * 100;
      }
    });

    const avg = total > 0 ? (obtained / total) * 100 : null;
    let grade = 'N/A';
    if (avg != null) {
      if (avg >= 90) grade = 'A+';
      else if (avg >= 80) grade = 'A';
      else if (avg >= 70) grade = 'B+';
      else if (avg >= 60) grade = 'B';
      else if (avg >= 50) grade = 'C';
      else if (avg >= 40) grade = 'D';
      else grade = 'F';

      if (avg > maxPct) {
        maxPct = avg;
        highest = { fullName: s.fullName, studentId: s.studentId, averagePercentage: avg };
      }
      if (avg < minPct) {
        minPct = avg;
        lowest = { fullName: s.fullName, studentId: s.studentId, averagePercentage: avg };
      }
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

  const overallAvg = totalMarksCount > 0 ? totalPercentageSum / totalMarksCount : 0;

  return {
    totalStudents: students.length,
    averagePercentage: Math.round(overallAvg * 10) / 10,
    highestScorer: highest,
    lowestScorer: lowest,
    performanceSummary,
  };
}

// ===== API WRAPPERS (Spring Boot Backend with Automatic Local Resilience) =====

export const fetchDashboard = async () => {
  try {
    return await api.get('/dashboard');
  } catch (err) {
    return { data: computeLocalDashboard() };
  }
};

export const fetchStudents = async (params = {}) => {
  try {
    return await api.get('/students', { params });
  } catch (err) {
    let list = getLocalStudents();
    const { search, className, performance, sortBy, sortDir } = params;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          (s.fullName && s.fullName.toLowerCase().includes(q)) ||
          (s.studentId && s.studentId.toLowerCase().includes(q))
      );
    }

    if (className && className !== 'all') {
      list = list.filter((s) => s.className && s.className.toLowerCase() === className.toLowerCase());
    }

    if (performance && performance !== 'all') {
      list = list.filter((s) => {
        const marks = s.marks || [];
        const obtained = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
        const total = marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
        const avg = total > 0 ? (obtained / total) * 100 : 0;
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
          return isAsc
            ? a.fullName.localeCompare(b.fullName)
            : b.fullName.localeCompare(a.fullName);
        }
        if (sortBy === 'studentId') {
          return isAsc
            ? a.studentId.localeCompare(b.studentId)
            : b.studentId.localeCompare(a.studentId);
        }
        if (sortBy === 'percentage') {
          const avgA = (a.marks || []).reduce((sum, m) => sum + m.marks, 0);
          const avgB = (b.marks || []).reduce((sum, m) => sum + m.marks, 0);
          return isAsc ? avgA - avgB : avgB - avgA;
        }
        return 0;
      });
    }

    return { data: list };
  }
};

export const fetchStudent = async (id) => {
  try {
    return await api.get(`/students/${id}`);
  } catch (err) {
    const list = getLocalStudents();
    const found = list.find((s) => String(s.id) === String(id));
    if (!found) throw new Error('Student not found');
    return { data: found };
  }
};

export const createStudent = async (data) => {
  try {
    return await api.post('/students', data);
  } catch (err) {
    const list = getLocalStudents();
    const newStudent = {
      ...data,
      id: Date.now(),
      marks: [],
    };
    list.push(newStudent);
    saveLocalStudents(list);
    return { data: newStudent };
  }
};

export const updateStudent = async (id, data) => {
  try {
    return await api.put(`/students/${id}`, data);
  } catch (err) {
    const list = getLocalStudents();
    const idx = list.findIndex((s) => String(s.id) === String(id));
    if (idx === -1) throw new Error('Student not found');
    list[idx] = { ...list[idx], ...data };
    saveLocalStudents(list);
    return { data: list[idx] };
  }
};

export const deleteStudent = async (id) => {
  try {
    return await api.delete(`/students/${id}`);
  } catch (err) {
    let list = getLocalStudents();
    list = list.filter((s) => String(s.id) !== String(id));
    saveLocalStudents(list);
    return { data: { success: true } };
  }
};

export const fetchMarks = async (studentId) => {
  try {
    return await api.get(`/students/${studentId}/marks`);
  } catch (err) {
    const list = getLocalStudents();
    const found = list.find((s) => String(s.id) === String(studentId));
    return { data: found ? found.marks || [] : [] };
  }
};

export const addMark = async (studentId, markData) => {
  try {
    return await api.post(`/students/${studentId}/marks`, markData);
  } catch (err) {
    const list = getLocalStudents();
    const student = list.find((s) => String(s.id) === String(studentId));
    if (!student) throw new Error('Student not found');
    const newMark = { ...markData, id: Date.now() };
    if (!student.marks) student.marks = [];
    student.marks.push(newMark);
    saveLocalStudents(list);
    return { data: newMark };
  }
};

export const updateMark = async (markId, markData) => {
  try {
    return await api.put(`/marks/${markId}`, markData);
  } catch (err) {
    const list = getLocalStudents();
    for (const s of list) {
      if (s.marks) {
        const mIdx = s.marks.findIndex((m) => String(m.id) === String(markId));
        if (mIdx !== -1) {
          s.marks[mIdx] = { ...s.marks[mIdx], ...markData };
          saveLocalStudents(list);
          return { data: s.marks[mIdx] };
        }
      }
    }
    throw new Error('Mark record not found');
  }
};

export const deleteMark = async (markId) => {
  try {
    return await api.delete(`/marks/${markId}`);
  } catch (err) {
    const list = getLocalStudents();
    for (const s of list) {
      if (s.marks) {
        s.marks = s.marks.filter((m) => String(m.id) !== String(markId));
      }
    }
    saveLocalStudents(list);
    return { data: { success: true } };
  }
};

export default api;
