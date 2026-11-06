import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarksForm from '../components/marks/MarksForm';

describe('MarksForm Component Validation Tests', () => {
  it('displays live calculated percentage and grade preview as user types', () => {
    render(
      <MarksForm
        studentId={1}
        editingMark={null}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    );

    const marksInput = screen.getByLabelText(/Marks Obtained \*/i);
    const totalInput = screen.getByLabelText(/Maximum Total Marks \*/i);

    fireEvent.change(marksInput, { target: { value: '92' } });
    fireEvent.change(totalInput, { target: { value: '100' } });

    expect(screen.getByText(/Calculated Result:/i)).toBeInTheDocument();
    expect(screen.getByText(/92.00%/i)).toBeInTheDocument();
    expect(screen.getByText(/A\+/i)).toBeInTheDocument();
  });

  it('rejects form submission when subject is blank', async () => {
    const onSavedMock = vi.fn();

    render(
      <MarksForm
        studentId={1}
        editingMark={null}
        onClose={vi.fn()}
        onSaved={onSavedMock}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Save Examination Record/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Subject name is required/i)).toBeInTheDocument();
    expect(onSavedMock).not.toHaveBeenCalled();
  });

  it('rejects form submission when marks obtained exceed total marks', async () => {
    const onSavedMock = vi.fn();

    render(
      <MarksForm
        studentId={1}
        editingMark={null}
        onClose={vi.fn()}
        onSaved={onSavedMock}
      />
    );

    const subjectInput = screen.getByLabelText(/Subject \*/i);
    const marksInput = screen.getByLabelText(/Marks Obtained \*/i);
    const totalInput = screen.getByLabelText(/Maximum Total Marks \*/i);

    fireEvent.change(subjectInput, { target: { value: 'Chemistry' } });
    fireEvent.change(marksInput, { target: { value: '110' } });
    fireEvent.change(totalInput, { target: { value: '100' } });

    const submitBtn = screen.getByRole('button', { name: /Save Examination Record/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Marks obtained \(110\) cannot exceed total maximum marks/i)).toBeInTheDocument();
    expect(onSavedMock).not.toHaveBeenCalled();
  });
});
