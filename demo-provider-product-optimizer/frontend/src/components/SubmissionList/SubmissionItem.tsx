import React from 'react';
import type { Submission } from '../../domain/entities/Submission/Submission';
import './SubmissionList.css';

interface SubmissionItemProps {
  submission: Submission;
  onEdit?: (submission: Submission) => void;
  onDelete?: (submission: Submission) => void;
  onRestore?: (submission: Submission) => void;
}

export const SubmissionItem: React.FC<SubmissionItemProps> = ({ submission, onEdit, onDelete, onRestore }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`submission-item ${submission.deletedAt ? 'deleted' : ''}`}>
      <div className="submission-header">
        <div className="submission-author">
          <strong>{submission.name}</strong>
          <span className="submission-email">{submission.email}</span>
        </div>
        <span className="submission-date">{formatDate(submission.createdAt)}</span>
      </div>

      <div className="submission-details">
        <span>{submission.city || 'Unknown city'}, {submission.country || 'Unknown country'}</span>
        <span className={`submission-status status-${(submission.status || 'Open').replace(' ', '-').toLowerCase()}`}>
          {submission.status || 'Open'}
        </span>
      </div>

      <div className="submission-message">{submission.message}</div>

      {submission.deletedAt && (
        <div className="submission-deleted">
          Deleted at: {formatDate(submission.deletedAt)}
        </div>
      )}

      <div className="submission-actions">
        {!submission.deletedAt && onEdit && (
          <button
            className="edit-button"
            onClick={() => onEdit(submission)}
            title="Edit submission"
          >
            ✏️ Edit
          </button>
        )}

        {!submission.deletedAt && onDelete && (
          <button
            className="delete-button"
            onClick={() => onDelete(submission)}
            title="Delete submission"
          >
            🗑️ Delete
          </button>
        )}

        {submission.deletedAt && onRestore && (
          <button
            className="restore-button"
            onClick={() => onRestore(submission)}
            title="Restore submission"
          >
            ♻️ Restore
          </button>
        )}
      </div>
    </div>
  );
};
