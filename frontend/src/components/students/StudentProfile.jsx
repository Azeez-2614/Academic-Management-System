import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPlus,
  FaEnvelope,
  FaPhone,
  FaBook,
  FaCalendarAlt,
  FaIdBadge,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { fetchStudent, deleteStudent, deleteMark } from '../../api/api';
import MarksForm from '../marks/MarksForm';
import ConfirmDialog from '../common/ConfirmDialog';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal and dialog states
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(false);
  const [markToDelete, setMarkToDelete] = useState(null);

  const loadStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStudent(id);
      setStudent(res.data);
    } catch (err) {
      setError('Student not found or server error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(id);
      toast.success('Student profile deleted');
      navigate('/students');
    } catch (err) {
      toast.error('Failed to delete student');
    } finally {
      setConfirmDeleteStudent(false);
    }
  };

  const handleDeleteMark = async () => {
    if (!markToDelete) return;
    try {
      await deleteMark(markToDelete.id);
      toast.success(`Marks for "${markToDelete.subject}" deleted`);
      loadStudent();
    } catch (err) {
      toast.error('Failed to delete mark record');
    } finally {
      setMarkToDelete(null);
    }
  };

  const getGradeBadge = (percentage) => {
    let grade = 'F';
    let badgeClass = 'badge badge-f';
    if (percentage >= 90) {
      grade = 'A+';
      badgeClass = 'badge badge-a';
    } else if (percentage >= 80) {
      grade = 'A';
      badgeClass = 'badge badge-a';
    } else if (percentage >= 70) {
      grade = 'B+';
      badgeClass = 'badge badge-b';
    } else if (percentage >= 60) {
      grade = 'B';
      badgeClass = 'badge badge-b';
    } else if (percentage >= 50) {
      grade = 'C';
      badgeClass = 'badge badge-c';
    } else if (percentage >= 40) {
      grade = 'D';
      badgeClass = 'badge badge-c';
    }
    return <span className={badgeClass}>{grade} ({percentage.toFixed(1)}%)</span>;
  };

  if (loading) return <div className="loading">Loading student profile...</div>;

  if (error || !student) {
    return (
      <div className="empty-state">
        <h3>Student Not Found</h3>
        <p>{error}</p>
        <Link to="/students" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Students
        </Link>
      </div>
    );
  }

  const marks = student.marks || [];
  const totalObtained = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
  const totalMax = marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/students" className="btn btn-outline btn-sm">
          <FaArrowLeft /> Back to Students
        </Link>
      </div>

      {/* Student Details Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h2>{student.fullName}</h2>
            <span className="badge badge-neutral" style={{ marginTop: '0.25rem' }}>
              ID: {student.studentId}
            </span>
          </div>
          <div className="action-buttons">
            <Link to={`/students/edit/${student.id}`} className="btn btn-outline btn-sm">
              <FaEdit /> Edit
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmDeleteStudent(true)}
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label><FaIdBadge /> Student ID</label>
              <span>{student.studentId}</span>
            </div>
            <div className="detail-item">
              <label><FaBook /> Class / Dept</label>
              <span>{student.className || 'Not Assigned'}</span>
            </div>
            <div className="detail-item">
              <label><FaEnvelope /> Email Address</label>
              <span>{student.email}</span>
            </div>
            <div className="detail-item">
              <label><FaPhone /> Phone Number</label>
              <span>{student.phone || '—'}</span>
            </div>
            <div className="detail-item">
              <label><FaCalendarAlt /> Date of Birth</label>
              <span>{student.dateOfBirth || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Marks Management Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Examination Marks ({marks.length})</h2>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingMark(null);
              setShowMarksModal(true);
            }}
          >
            <FaPlus /> Add Marks
          </button>
        </div>

        <div className="card-body">
          {marks.length > 0 ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam Type</th>
                      <th>Marks Obtained</th>
                      <th>Total Marks</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m) => {
                      const pct = m.totalMarks > 0 ? (m.marks / m.totalMarks) * 100 : 0;
                      return (
                        <tr key={m.id}>
                          <td><strong>{m.subject}</strong></td>
                          <td>
                            <span className="badge badge-neutral">{m.examType}</span>
                          </td>
                          <td>{m.marks}</td>
                          <td>{m.totalMarks}</td>
                          <td>{getGradeBadge(pct)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="btn-icon"
                                title="Edit Mark"
                                onClick={() => {
                                  setEditingMark(m);
                                  setShowMarksModal(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                className="btn-icon danger"
                                title="Delete Mark"
                                onClick={() => setMarkToDelete(m)}
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

              {/* Total & Cumulative Summary */}
              <div className="marks-summary-banner">
                <div className="summary-stat">
                  <span className="label">Total Score</span>
                  <span className="value">{totalObtained} / {totalMax}</span>
                </div>
                <div className="summary-stat">
                  <span className="label">Overall Percentage</span>
                  <span className="value">{overallPercentage.toFixed(1)}%</span>
                </div>
                <div className="summary-stat">
                  <span className="label">Overall Grade</span>
                  <span className="value">{getGradeBadge(overallPercentage)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No marks entered yet for this student.</p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '0.75rem' }}
                onClick={() => {
                  setEditingMark(null);
                  setShowMarksModal(true);
                }}
              >
                <FaPlus /> Add First Mark Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Marks Modal */}
      {showMarksModal && (
        <MarksForm
          studentId={student.id}
          editingMark={editingMark}
          onClose={() => setShowMarksModal(false)}
          onSaved={loadStudent}
        />
      )}

      {/* Delete Student Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to delete "${student.fullName}"? All examination records will also be deleted.`}
        confirmText="Delete Student"
        onConfirm={handleDeleteStudent}
        onCancel={() => setConfirmDeleteStudent(false)}
      />

      {/* Delete Mark Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(markToDelete)}
        title="Delete Examination Mark"
        message={`Delete mark record for "${markToDelete?.subject}"?`}
        confirmText="Delete"
        onConfirm={handleDeleteMark}
        onCancel={() => setMarkToDelete(null)}
      />
    </div>
  );
}
