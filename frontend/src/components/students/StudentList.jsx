import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { fetchStudents, deleteStudent } from '../../api/api';
import ConfirmDialog from '../common/ConfirmDialog';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and sorting states
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Deletion modal state
  const [studentToDelete, setStudentToDelete] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        className: selectedClass !== 'all' ? selectedClass : undefined,
        performance: performanceFilter !== 'all' ? performanceFilter : undefined,
        sortBy,
        sortDir,
      };
      const res = await fetchStudents(params);
      setStudents(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to retrieve students from server');
    } finally {
      setLoading(false);
    }
  }, [search, selectedClass, performanceFilter, sortBy, sortDir]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      loadStudents();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.id);
      toast.success(`Student ${studentToDelete.fullName || studentToDelete.name} deleted`);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete student');
    } finally {
      setStudentToDelete(null);
    }
  };

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Derive distinct classes from loaded list or defaults
  const classOptions = ['all', 'Grade 10 - A', 'Grade 11 - B', 'Grade 12 - Science'];

  const getStudentAverage = (s) => {
    if (!s.marks || s.marks.length === 0) return null;
    const obtained = s.marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
    const total = s.marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
    return total > 0 ? (obtained / total) * 100 : null;
  };

  const getGradeBadge = (percentage) => {
    if (percentage == null) return <span className="badge badge-neutral">No Marks</span>;
    if (percentage >= 80) return <span className="badge badge-a">Distinction ({percentage.toFixed(0)}%)</span>;
    if (percentage >= 50) return <span className="badge badge-b">Pass ({percentage.toFixed(0)}%)</span>;
    return <span className="badge badge-f">Needs Help ({percentage.toFixed(0)}%)</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Student Directory</h1>
          <p className="text-muted">Manage all enrolled students, contact info, and examination records</p>
        </div>
        <Link to="/students/new" className="btn btn-primary">
          <FaPlus /> Register Student
        </Link>
      </div>

      {/* Toolbar: Search, Filters, Sorting */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div className="toolbar-grid">
            {/* Search Input */}
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Filter by Class */}
            <div className="filter-item">
              <label htmlFor="classFilter"><FaFilter /> Class:</label>
              <select
                id="classFilter"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">All Classes</option>
                {classOptions.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter by Academic Performance */}
            <div className="filter-item">
              <label htmlFor="perfFilter">Performance:</label>
              <select
                id="perfFilter"
                value={performanceFilter}
                onChange={(e) => setPerformanceFilter(e.target.value)}
              >
                <option value="all">All Performance</option>
                <option value="distinction">Distinction (≥75%)</option>
                <option value="average">Average (40–74%)</option>
                <option value="low">Needs Help (&lt;40%)</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="filter-item">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="studentId">Student ID</option>
                <option value="percentage">Marks / %</option>
              </select>
              <button
                type="button"
                className="btn-icon"
                title={`Sort ${sortDir.toUpperCase()}`}
                onClick={toggleSortDir}
                style={{ marginLeft: '0.25rem' }}
              >
                {sortDir === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="card">
        <div className="card-header">
          <h2>Registered Students ({students.length})</h2>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="loading">Loading student records...</div>
          ) : error ? (
            <div className="empty-state">
              <p>{error}</p>
              <button type="button" className="btn btn-primary" onClick={loadStudents}>
                Retry
              </button>
            </div>
          ) : students.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Class / Dept</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Performance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const avg = getStudentAverage(s);
                    return (
                      <tr key={s.id}>
                        <td>
                          <span className="badge badge-neutral">
                            {s.studentId}
                          </span>
                        </td>
                        <td>
                          <Link to={`/students/${s.id}`} className="student-name-link">
                            <strong>{s.fullName || s.name}</strong>
                          </Link>
                        </td>
                        <td>{s.className || '—'}</td>
                        <td>{s.email || '—'}</td>
                        <td>{s.phone || '—'}</td>
                        <td>{getGradeBadge(avg)}</td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/students/${s.id}`}
                              className="btn-icon"
                              title="View Profile & Marks"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/students/edit/${s.id}`}
                              className="btn-icon"
                              title="Edit Details"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              type="button"
                              className="btn-icon danger"
                              title="Delete Record"
                              onClick={() => setStudentToDelete(s)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Students Found</h3>
              <p>
                {search || selectedClass !== 'all' || performanceFilter !== 'all'
                  ? 'No students matched your search and filter criteria.'
                  : 'There are currently no students registered in the system.'}
              </p>
              <Link to="/students/new" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                <FaPlus /> Register First Student
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        title="Confirm Student Deletion"
        message={`Are you sure you want to remove ${
          studentToDelete?.fullName || studentToDelete?.name
        } (ID: ${studentToDelete?.studentId})? This action cannot be undone.`}
        confirmText="Delete Student"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
