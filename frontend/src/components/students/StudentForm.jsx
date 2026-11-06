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
      toast.error(err.userMessage || 'Failed to load student details for editing');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    const idVal = form.studentId.trim();
    if (!idVal) {
      errs.studentId = 'Student ID is required';
    } else if (idVal.length < 3 || idVal.length > 20) {
      errs.studentId = 'Student ID must be between 3 and 20 characters';
    } else if (!/^[A-Za-z0-9_-]+$/.test(idVal)) {
      errs.studentId = 'Student ID may only contain letters, numbers, hyphens, and underscores';
    }

    const nameVal = form.fullName.trim();
    if (!nameVal) {
      errs.fullName = 'Full Name is required';
    } else if (nameVal.length < 2 || nameVal.length > 100) {
      errs.fullName = 'Full Name must be between 2 and 100 characters';
    }

    const emailVal = form.email.trim();
    if (!emailVal) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errs.email = 'Please provide a valid email address';
    }

    if (form.phone && form.phone.trim()) {
      if (!/^(\+?[0-9]{1,4}[ -]?)?[0-9]{7,15}$/.test(form.phone.trim())) {
        errs.phone = 'Phone number must be a valid format (e.g. +1 555-0101)';
      }
    }

    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const now = new Date();
      if (dob >= now) {
        errs.dateOfBirth = 'Date of birth must be a past date';
      }
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
    if (!validate()) {
      toast.warn('Please resolve validation errors before saving');
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
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const mappedErrors = {};
        backendErrors.forEach((errMsg) => {
          if (errMsg.includes('studentId')) mappedErrors.studentId = errMsg;
          else if (errMsg.includes('fullName')) mappedErrors.fullName = errMsg;
          else if (errMsg.includes('email')) mappedErrors.email = errMsg;
          else if (errMsg.includes('phone')) mappedErrors.phone = errMsg;
        });
        setErrors(mappedErrors);
      }
      const msg = err.userMessage || err.response?.data?.message || 'Error saving student record';
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. student@school.edu"
                  className={errors.email ? 'input-error' : ''}
                  disabled={submitting}
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
                  className={errors.phone ? 'input-error' : ''}
                  disabled={submitting}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              {/* Class / Department */}
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

              {/* Date of Birth */}
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className={errors.dateOfBirth ? 'input-error' : ''}
                  disabled={submitting}
                />
                {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
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
                  disabled={submitting}
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
