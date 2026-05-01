import React, { useState, useEffect } from 'react';
import { SubmissionItem } from './SubmissionItem';
import { apiService } from '../../services/api';
import type { Submission } from '../../domain/entities/Submission/Submission';
import './SubmissionList.css';

export const SubmissionList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Expose refresh function to parent via custom event
  useEffect(() => {
    const handleRefresh = () => {
      fetchSubmissions();
    };

    window.addEventListener('refreshSubmissions', handleRefresh);
    return () => {
      window.removeEventListener('refreshSubmissions', handleRefresh);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="submission-list">
        <h2 className="submission-list-title">Submissions</h2>
        <div className="loading">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submission-list">
        <h2 className="submission-list-title">Submissions</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchSubmissions} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-list">
      <div className="submission-list-header">
        <h2 className="submission-list-title">Submissions</h2>
        <button onClick={fetchSubmissions} className="refresh-button" title="Refresh">
          ↻
        </button>
      </div>
      {submissions.length === 0 ? (
        <div className="empty-state">No submissions yet. Be the first to submit!</div>
      ) : (
        <div className="submission-items">
          {submissions.map((submission) => (
            <SubmissionItem key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
};
