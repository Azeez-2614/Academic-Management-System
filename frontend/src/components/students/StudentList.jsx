import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { fetchStudents, deleteStudent } from '../../api/api';
import ConfirmDialog from '../common/ConfirmDialog';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    loadStudents(search);
  }, [search]);

  const loadStudents = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStudents(query.trim());
      setStudents(res.data || []);
    } catch (err) {
      setError('Unable to load students from server. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.id);
      toast.success(`Student "${studentToDelete.fullName}" deleted successfully`);
      loadStudents(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setStudentToDelete(null);
    }
  };

  const getStudentAverage = (s) => {
    if (!s.marks || s.marks.length === 0) return null;
    const obtained = s.marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
    const total = s.marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
    return total > 0 ? (obtained / total) * 100 : null;
  };

  const getGradeBadge = (percentage) => {
    if (percentage == null) return <span className="badge badge-neutral">No Marks</span>;
    if (percentage >= 90) return <span className="badge badge-a">A+ ({percentage.toFixed(0)}%)</span>;
    if (percentage >= 80) return <span className="badge badge-a">A ({percentage.toFixed(0)}%)</span>;
    if (percentage >= 70) return <span className="badge badge-b">B+ ({percentage.toFixed(0)}%)</span>;
    if (percentage >= 60) return <span className="badge badge-b">B ({percentage.toFixed(0)}%)</span>;
    if (percentage >= 50) return <span className="badge badge-c">C ({percentage.toFixed(0)}%)</span>;
    if (percentage >= 40) return <span className="badge badge-c">D ({percentage.toFixed(0)}%)</span>;
    return <span className="badge badge-f">F ({percentage.toFixed(0)}%)</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Student Directory</h1>
          <p className="text-muted">View, search, edit, and delete student records</p>
        </div>
        <Link to="/students/new" className="btn btn-primary">
          <FaPlus /> Add Student
        </Link>
      </div>

      {/* Search Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search students by name or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="card">
        <div className="card-header">
          <h2>All Students ({students.length})</h2>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading students...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p className="error-text">{error}</p>
              <button type="button" className="btn btn-primary" onClick={() => loadStudents(search)} style={{ marginTop: '0.75rem' }}>
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
                          <span className="badge badge-neutral">{s.studentId}</span>
                        </td>
                        <td>
                          <Link to={`/students/${s.id}`} className="student-name-link">
                            <strong>{s.fullName}</strong>
                          </Link>
                        </td>
                        <td>{s.className || '—'}</td>
                        <td>{s.email}</td>
                        <td>{s.phone || '—'}</td>
                        <td>{getGradeBadge(avg)}</td>
                        <td>
                          <div className="action-buttons">
                            <Link to={`/students/${s.id}`} className="btn-icon" title="View Profile">
                              <FaEye />
                            </Link>
                            <Link to={`/students/edit/${s.id}`} className="btn-icon" title="Edit Student">
                              <FaEdit />
                            </Link>
                            <button
                              type="button"
                              className="btn-icon danger"
                              title="Delete Student"
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
              <p>{search ? 'No student matches your search.' : 'No students added yet.'}</p>
              <Link to="/students/new" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                <FaPlus /> Add Student
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        title="Delete Student"
        message={`Are you sure you want to delete "${studentToDelete?.fullName}" (${studentToDelete?.studentId})? This will also remove all their marks.`}
        confirmText="Yes, Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
