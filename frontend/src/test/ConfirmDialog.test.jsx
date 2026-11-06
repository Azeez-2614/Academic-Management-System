import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDialog from '../components/common/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Record"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title, message and buttons when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Student Record"
        message="Are you sure you want to delete Aarav Sharma?"
        confirmText="Confirm Delete"
        cancelText="Dismiss"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Student Record')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete Aarav Sharma?')).toBeInTheDocument();
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('triggers onConfirm callback when confirmed', () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Student"
        message="Confirm action"
        confirmText="Delete"
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(onCancelMock).not.toHaveBeenCalled();
  });

  it('triggers onCancel callback when cancelled', () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Student"
        message="Confirm action"
        cancelText="Cancel"
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
    expect(onConfirmMock).not.toHaveBeenCalled();
  });
});
