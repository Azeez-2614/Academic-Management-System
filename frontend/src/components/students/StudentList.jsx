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
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { fetchStudents, deleteStudent } from '../../api/api';
import ConfirmDialog from '../common/ConfirmDialog';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

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
        page,
        size,
      };

      const res = await fetchStudents(params);
      const data = res.data;

      if (Array.isArray(data)) {
        setStudents(data);
        setTotalElements(data.length);
        setTotalPages(Math.ceil(data.length / size) || 1);
      } else if (data && data.content) {
        setStudents(data.content);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setStudents([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch (err) {
      const msg = err.userMessage || err.response?.data?.message || 'Unable to retrieve students from server';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, selectedClass, performanceFilter, sortBy, sortDir, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  // Reset to first page when search/filter criteria change
  useEffect(() => {
    setPage(0);
  }, [search, selectedClass, performanceFilter, sortBy, sortDir]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.id);
      toast.success(`Student ${studentToDelete.fullName || studentToDelete.name} deleted successfully`);
      loadStudents();
    } catch (err) {
      const msg = err.userMessage || err.response?.data?.message || 'Failed to delete student record';
      toast.error(msg);
    } finally {
      setStudentToDelete(null);
    }
  };

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const classOptions = ['all', 'Grade 10 - A', 'Grade 11 - B', 'Grade 12 - Science'];

  const getStudentAverage = (s) => {
    if (!s.marks || s.marks.length === 0) return null;
    const obtained = s.marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
    const total = s.marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
    return total > 0 ? (obtained / total) * 100 : null;
  };

  const getGradeBadge = (percentage) => {
    if (percentage == null) return <span className="badge badge-neutral">No Records</span>;
    if (percentage >= 90) return <span className="badge badge-a">A+ ({percentage.toFixed(1)}%)</span>;
    if (percentage >= 80) return <span className="badge badge-a">A ({percentage.toFixed(1)}%)</span>;
    if (percentage >= 70) return <span className="badge badge-b">B+ ({percentage.toFixed(1)}%)</span>;
    if (percentage >= 60) return <span className="badge badge-b">B ({percentage.toFixed(1)}%)</span>;
    if (percentage >= 50) return <span className="badge badge-c">C ({percentage.toFixed(1)}%)</span>;
    if (percentage >= 40) return <span className="badge badge-c">D ({percentage.toFixed(1)}%)</span>;
    return <span className="badge badge-f">F ({percentage.toFixed(1)}%)</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Student Directory</h1>
          <p className="text-muted">Manage enrolled students, contact info, and examination records</p>
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
                placeholder="Search by name, ID, or email..."
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
                <option value="all">All Tiers</option>
                <option value="distinction">Distinction (≥75%)</option>
                <option value="average">Average (40–74.9%)</option>
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
                <option value="email">Email</option>
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
          <h2>Registered Students ({totalElements})</h2>
          {totalElements > 0 && (
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              Showing {students.length} of {totalElements}
            </span>
          )}
        </div>

        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading student records...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p className="error-text">{error}</p>
              <button type="button" className="btn btn-primary" onClick={loadStudents} style={{ marginTop: '0.75rem' }}>
                Retry Connection
              </button>
            </div>
          ) : students.length > 0 ? (
            <>
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

              {/* Backend Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <span className="pagination-info">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="pagination-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <FaChevronLeft /> Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`pagination-number-btn ${i === page ? 'active' : ''}`}
                        onClick={() => setPage(i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    >
                      Next <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
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
