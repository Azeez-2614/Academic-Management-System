import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalculator } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { addMark, updateMark } from '../../api/api';

const DEFAULT_FORM = {
  subject: '',
  marks: '',
  totalMarks: '100',
  examType: 'Mid-Term',
};

export default function MarksForm({ studentId, editingMark, onClose, onSaved }) {
  const isEditing = Boolean(editingMark);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingMark) {
      setForm({
        subject: editingMark.subject || '',
        marks: editingMark.marks != null ? String(editingMark.marks) : '',
        totalMarks: editingMark.totalMarks != null ? String(editingMark.totalMarks) : '100',
        examType: editingMark.examType || 'Mid-Term',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editingMark]);

  const marksNum = parseFloat(form.marks);
  const totalNum = parseFloat(form.totalMarks);

  // Live calculation of percentage and grade
  const livePct =
    !isNaN(marksNum) && !isNaN(totalNum) && totalNum > 0 && marksNum >= 0 && marksNum <= totalNum
      ? Math.round((marksNum / totalNum) * 10000) / 100
      : null;

  const getLiveGrade = (pct) => {
    if (pct == null) return null;
    if (pct >= 90.0) return 'A+';
    if (pct >= 80.0) return 'A';
    if (pct >= 70.0) return 'B+';
    if (pct >= 60.0) return 'B';
    if (pct >= 50.0) return 'C';
    if (pct >= 40.0) return 'D';
    return 'F';
  };

  const liveGrade = getLiveGrade(livePct);

  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) {
      errs.subject = 'Subject name is required';
    } else if (form.subject.trim().length < 2 || form.subject.trim().length > 100) {
      errs.subject = 'Subject name must be between 2 and 100 characters';
    }

    if (form.marks === '' || isNaN(marksNum)) {
      errs.marks = 'Marks obtained is required and must be a valid number';
    } else if (marksNum < 0) {
      errs.marks = 'Marks obtained cannot be negative';
    }

    if (form.totalMarks === '' || isNaN(totalNum)) {
      errs.totalMarks = 'Total marks is required';
    } else if (totalNum <= 0) {
      errs.totalMarks = 'Total marks must be strictly greater than 0';
    } else if (!isNaN(marksNum) && marksNum > totalNum) {
      errs.marks = `Marks obtained (${marksNum}) cannot exceed total maximum marks (${totalNum})`;
    }

    if (!form.examType || !form.examType.trim()) {
      errs.examType = 'Exam type is required';
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

    const payload = {
      subject: form.subject.trim(),
      marks: parseFloat(form.marks),
      totalMarks: parseFloat(form.totalMarks),
      examType: form.examType.trim(),
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateMark(editingMark.id, payload);
        toast.success(`Marks for "${payload.subject}" updated successfully`);
      } else {
        await addMark(studentId, payload);
        toast.success(`Marks for "${payload.subject}" added successfully`);
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.userMessage || err.response?.data?.message || 'Failed to save examination marks';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Examination Marks' : 'Add Examination Marks'}</h3>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close" disabled={saving}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid single-column">
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Mathematics, Physics, Chemistry"
                  className={errors.subject ? 'input-error' : ''}
                  disabled={saving}
                />
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="examType">Exam Type *</label>
                <select
                  id="examType"
                  name="examType"
                  value={form.examType}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final">Final</option>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Practical">Practical</option>
                </select>
                {errors.examType && <span className="field-error">{errors.examType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="marks">Marks Obtained *</label>
                <input
                  id="marks"
                  name="marks"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.marks}
                  onChange={handleChange}
                  placeholder="e.g. 88.5"
                  className={errors.marks ? 'input-error' : ''}
                  disabled={saving}
                />
                {errors.marks && <span className="field-error">{errors.marks}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="totalMarks">Maximum Total Marks *</label>
                <input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.totalMarks}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  className={errors.totalMarks ? 'input-error' : ''}
                  disabled={saving}
                />
                {errors.totalMarks && <span className="field-error">{errors.totalMarks}</span>}
              </div>

              {/* Dynamic Live Calculation Preview */}
              {livePct != null && (
                <div className="live-grading-preview">
                  <FaCalculator />
                  <span>
                    Calculated Result: <strong>{livePct.toFixed(2)}%</strong> — Grade:{' '}
                    <span className={`badge ${liveGrade === 'A+' || liveGrade === 'A' ? 'badge-a' : liveGrade.startsWith('B') ? 'badge-b' : liveGrade === 'F' ? 'badge-f' : 'badge-c'}`}>
                      {liveGrade}
                    </span>
                  </span>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving Marks...' : isEditing ? 'Update Marks' : 'Save Examination Record'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
