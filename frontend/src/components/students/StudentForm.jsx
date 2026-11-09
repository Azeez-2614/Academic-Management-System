import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchStudent, createStudent, updateStudent } from '../../api/api';

const INITIAL_FORM = {
  studentId: '',
  fullName: '',
  email: '',
  phone: '',
  className: '',
  dateOfBirth: '',
};

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadStudent();
    }
  }, [id, isEditing]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await fetchStudent(id);
      const data = res.data;
      setForm({
        studentId: data.studentId || '',
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        className: data.className || '',
        dateOfBirth: data.dateOfBirth || '',
      });
    } catch (err) {
      toast.error('Failed to load student details');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend validation
    if (!form.studentId.trim() || !form.fullName.trim() || !form.email.trim()) {
      setError('Student ID, Full Name, and Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        studentId: form.studentId.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        className: form.className.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
      };

      if (isEditing) {
        await updateStudent(id, payload);
        toast.success(`Student "${payload.fullName}" updated successfully!`);
      } else {
        await createStudent(payload);
        toast.success(`Student "${payload.fullName}" registered successfully!`);
      }
      navigate('/students');
    } catch (err) {
      const message = err.response?.data?.message || 'Error saving student. Please check input details.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading student form...</div>;
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2>{isEditing ? 'Edit Student Details' : 'Register New Student'}</h2>
        </div>

        <div className="card-body">
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="studentId">Student ID *</label>
                <input
                  id="studentId"
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  placeholder="e.g. STU101"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. aarav@school.edu"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-0101"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="className">Class / Department</label>
                <input
                  id="className"
                  name="className"
                  value={form.className}
                  onChange={handleChange}
                  placeholder="e.g. Grade 10 - A"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-actions">
                <Link to="/students" className="btn btn-outline" disabled={submitting}>
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : isEditing ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
