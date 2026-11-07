import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalculator } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { addMark, updateMark } from '../../api/api';

const DEFAULT_FORM = {
  subject: '',
  examType: 'Mid-Term',
  marks: '',
  totalMarks: '100',
};

export default function MarksForm({ studentId, editingMark, onClose, onSaved }) {
  const isEditing = Boolean(editingMark);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingMark) {
      setForm({
        subject: editingMark.subject || '',
        examType: editingMark.examType || 'Mid-Term',
        marks: editingMark.marks != null ? String(editingMark.marks) : '',
        totalMarks: editingMark.totalMarks != null ? String(editingMark.totalMarks) : '100',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editingMark]);

  const marksNum = parseFloat(form.marks);
  const totalNum = parseFloat(form.totalMarks);

  // Automatic percentage calculation
  const calculatedPct =
    !isNaN(marksNum) && !isNaN(totalNum) && totalNum > 0 && marksNum >= 0 && marksNum <= totalNum
      ? Math.round((marksNum / totalNum) * 10000) / 100
      : null;

  // Automatic grade calculation
  const calculateGrade = (pct) => {
    if (pct == null) return null;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const calculatedGrade = calculateGrade(calculatedPct);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject.trim()) {
      setError('Subject name is required.');
      return;
    }

    if (isNaN(marksNum) || marksNum < 0) {
      setError('Obtained marks must be a valid positive number.');
      return;
    }

    if (isNaN(totalNum) || totalNum <= 0) {
      setError('Total marks must be greater than zero.');
      return;
    }

    if (marksNum > totalNum) {
      setError(`Obtained marks (${marksNum}) cannot exceed total marks (${totalNum}).`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        subject: form.subject.trim(),
        examType: form.examType,
        marks: marksNum,
        totalMarks: totalNum,
      };

      if (isEditing) {
        await updateMark(editingMark.id, payload);
        toast.success(`Marks for "${payload.subject}" updated!`);
      } else {
        await addMark(studentId, payload);
        toast.success(`Marks for "${payload.subject}" added!`);
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save examination marks.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Marks' : 'Add Examination Marks'}</h3>
          <button type="button" className="btn-icon" onClick={onClose} disabled={saving}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid single-column">
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Mathematics"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="examType">Examination Type *</label>
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
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="marks">Obtained Marks *</label>
                <input
                  id="marks"
                  name="marks"
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.marks}
                  onChange={handleChange}
                  placeholder="e.g. 85"
                  required
                  disabled={saving}
                />
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
                  required
                  disabled={saving}
                />
              </div>

              {/* Automatic Live Calculation Display */}
              {calculatedPct != null && (
                <div className="live-grading-preview">
                  <FaCalculator />
                  <span>
                    Percentage: <strong>{calculatedPct.toFixed(1)}%</strong> — Grade:{' '}
                    <strong>{calculatedGrade}</strong>
                  </span>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Update Marks' : 'Save Marks'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
