import React from 'react';
import type { Submission } from '../../domain/entities/Submission/Submission';
import './SubmissionList.css';

interface SubmissionItemProps {
  submission: Submission;
  onEdit?: (submission: Submission) => void;
}

export const SubmissionItem: React.FC<SubmissionItemProps> = ({ submission, onEdit }) => {
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
    <div className="submission-item">
      <div className="submission-header">
        <div className="submission-author">
          <strong>{submission.name}</strong>
          <span className="submission-email">{submission.email}</span>
        </div>
        <span className="submission-date">{formatDate(submission.createdAt)}</span>
      </div>
      <div className="submission-message">{submission.message}</div>
      {onEdit && (
        <div className="submission-actions">
          <button
            className="edit-button"
            onClick={() => onEdit(submission)}
            title="Edit submission"
          >
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
};
