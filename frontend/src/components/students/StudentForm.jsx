import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchStudent, createStudent, updateStudent } from '../../api/api';

const INITIAL_STATE = {
  studentId: '',
  fullName: '',
  email: '',
  phone: '',
  className: '',
  dateOfBirth: '',
  enrollmentDate: new Date().toISOString().split('T')[0],
};

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadStudentData();
    }
  }, [id, isEditing]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const res = await fetchStudent(id);
      const data = res.data;
      setForm({
        studentId: data.studentId || '',
        fullName: data.fullName || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        className: data.className || '',
        dateOfBirth: data.dateOfBirth || '',
        enrollmentDate: data.enrollmentDate || '',
      });
    } catch (err) {
      toast.error('Failed to load student details for editing');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.studentId.trim()) {
      errs.studentId = 'Student ID is required (e.g. STU101)';
    }
    if (!form.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please provide a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        studentId: form.studentId.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        className: form.className.trim(),
        dateOfBirth: form.dateOfBirth || null,
        enrollmentDate: form.enrollmentDate || null,
      };

      if (isEditing) {
        await updateStudent(id, payload);
        toast.success(`Student ${payload.fullName} updated successfully!`);
      } else {
        await createStudent(payload);
        toast.success(`Student ${payload.fullName} registered successfully!`);
      }
      navigate('/students');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error saving student record';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading student form...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h2>{isEditing ? 'Update Student Information' : 'Register New Student'}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              {isEditing
                ? 'Modify the academic and contact details for this student'
                : 'Fill in the information below to add a student to the institution directory'}
            </p>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Student ID */}
              <div className="form-group">
                <label htmlFor="studentId">Student ID *</label>
                <input
                  id="studentId"
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  placeholder="e.g. STU101"
                  className={errors.studentId ? 'input-error' : ''}
                />
                {errors.studentId && <span className="field-error">{errors.studentId}</span>}
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={errors.fullName ? 'input-error' : ''}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              {/* Class / Department */}
              <div className="form-group">
                <label htmlFor="className">Class / Department</label>
                <input
                  id="className"
                  name="className"
                  value={form.className}
                  onChange={handleChange}
                  placeholder="e.g. Grade 10 - A or Computer Science"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. student@school.edu"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-0101"
                />
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              {/* Enrollment Date */}
              <div className="form-group">
                <label htmlFor="enrollmentDate">Enrollment Date</label>
                <input
                  id="enrollmentDate"
                  name="enrollmentDate"
                  type="date"
                  value={form.enrollmentDate}
                  onChange={handleChange}
                />
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Link to="/students" className="btn btn-outline" disabled={submitting}>
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : isEditing ? 'Update Student Record' : 'Register Student'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
