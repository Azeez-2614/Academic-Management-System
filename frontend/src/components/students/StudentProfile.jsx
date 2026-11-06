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

  // Modal states
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState(null);

  // Confirm dialog states
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(false);
  const [markToDelete, setMarkToDelete] = useState(null);

  const loadStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStudent(id);
      setStudent(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Student not found or server error');
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
      toast.success('Student profile deleted successfully');
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete student');
    } finally {
      setConfirmDeleteStudent(false);
    }
  };

  const handleDeleteMark = async () => {
    if (!markToDelete) return;
    try {
      await deleteMark(markToDelete.id);
      toast.success(`Marks for ${markToDelete.subject} deleted`);
      loadStudent();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete mark record');
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
        <p>{error || 'The requested student record does not exist.'}</p>
        <Link to="/students" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Student List
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
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/students" className="btn btn-outline btn-sm">
          <FaArrowLeft /> Back to Students
        </Link>
      </div>

      {/* Student Details Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <h2>{student.fullName}</h2>
            <span className="badge badge-b" style={{ marginTop: '0.25rem' }}>
              ID: {student.studentId}
            </span>
          </div>
          <div className="action-buttons">
            <Link to={`/students/edit/${student.id}`} className="btn btn-outline btn-sm">
              <FaEdit /> Edit Details
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmDeleteStudent(true)}
            >
              <FaTrash /> Delete Student
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
              <label><FaBook /> Class / Department</label>
              <span>{student.className || 'Not Assigned'}</span>
            </div>
            <div className="detail-item">
              <label><FaEnvelope /> Email Address</label>
              <span>{student.email || '—'}</span>
            </div>
            <div className="detail-item">
              <label><FaPhone /> Phone Number</label>
              <span>{student.phone || '—'}</span>
            </div>
            <div className="detail-item">
              <label><FaCalendarAlt /> Date of Birth</label>
              <span>{student.dateOfBirth || '—'}</span>
            </div>
            <div className="detail-item">
              <label><FaCalendarAlt /> Enrollment Date</label>
              <span>{student.enrollmentDate || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Marks Management Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Academic Examination Records</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Subject-wise scores, calculations, and automated grade evaluations
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingMark(null);
              setIsMarksModalOpen(true);
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
                      <th>Percentage & Grade</th>
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
                            <span className="badge badge-b">{m.examType || 'General'}</span>
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
                                  setIsMarksModalOpen(true);
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

              {/* Academic Performance Summary */}
              <div className="marks-summary-banner">
                <div className="summary-stat">
                  <span className="label">Subjects Recorded</span>
                  <span className="value">{marks.length}</span>
                </div>
                <div className="summary-stat">
                  <span className="label">Total Score</span>
                  <span className="value">{totalObtained} / {totalMax}</span>
                </div>
                <div className="summary-stat">
                  <span className="label">Cumulative Percentage</span>
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
              <p>No examination marks have been entered for this student yet.</p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '0.75rem' }}
                onClick={() => {
                  setEditingMark(null);
                  setIsMarksModalOpen(true);
                }}
              >
                <FaPlus /> Add First Mark Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Marks Form Modal */}
      {isMarksModalOpen && (
        <MarksForm
          studentId={student.id}
          editingMark={editingMark}
          onClose={() => setIsMarksModalOpen(false)}
          onSaved={loadStudent}
        />
      )}

      {/* Confirm Delete Student Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteStudent}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete "${student.fullName}" (ID: ${student.studentId})? All academic and examination records will also be removed.`}
        confirmText="Yes, Delete Student"
        onConfirm={handleDeleteStudent}
        onCancel={() => setConfirmDeleteStudent(false)}
      />

      {/* Confirm Delete Mark Dialog */}
      <ConfirmDialog
        isOpen={Boolean(markToDelete)}
        title="Delete Examination Mark"
        message={`Are you sure you want to delete the examination entry for "${markToDelete?.subject}" (${markToDelete?.examType})?`}
        confirmText="Delete Mark"
        onConfirm={handleDeleteMark}
        onCancel={() => setMarkToDelete(null)}
      />
    </div>
  );
}
