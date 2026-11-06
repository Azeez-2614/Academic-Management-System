import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
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

  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) {
      errs.subject = 'Subject name is required';
    }

    const marksNum = parseFloat(form.marks);
    const totalNum = parseFloat(form.totalMarks);

    if (form.marks === '' || isNaN(marksNum)) {
      errs.marks = 'Marks obtained is required';
    } else if (marksNum < 0) {
      errs.marks = 'Marks cannot be negative';
    }

    if (form.totalMarks === '' || isNaN(totalNum)) {
      errs.totalMarks = 'Total marks is required';
    } else if (totalNum <= 0) {
      errs.totalMarks = 'Total marks must be greater than 0';
    } else if (!isNaN(marksNum) && marksNum > totalNum) {
      errs.marks = `Marks obtained cannot exceed total marks (${totalNum})`;
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
      examType: form.examType,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateMark(editingMark.id, payload);
        toast.success(`Marks for ${payload.subject} updated successfully`);
      } else {
        await addMark(studentId, payload);
        toast.success(`Marks for ${payload.subject} added successfully`);
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to save marks';
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
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
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
                />
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="examType">Exam Type</label>
                <select
                  id="examType"
                  name="examType"
                  value={form.examType}
                  onChange={handleChange}
                >
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final">Final</option>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="marks">Marks Obtained *</label>
                <input
                  id="marks"
                  name="marks"
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.marks}
                  onChange={handleChange}
                  placeholder="e.g. 85"
                  className={errors.marks ? 'input-error' : ''}
                />
                {errors.marks && <span className="field-error">{errors.marks}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="totalMarks">Total / Maximum Marks *</label>
                <input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  step="0.5"
                  min="1"
                  value={form.totalMarks}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  className={errors.totalMarks ? 'input-error' : ''}
                />
                {errors.totalMarks && <span className="field-error">{errors.totalMarks}</span>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Update Marks' : 'Add Marks'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
