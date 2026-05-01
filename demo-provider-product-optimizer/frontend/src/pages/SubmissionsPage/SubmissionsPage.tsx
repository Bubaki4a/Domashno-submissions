import React, { useState, useEffect } from 'react';
import { SubmissionItem } from '../../components/SubmissionList/SubmissionItem';
import { apiService } from '../../services/api';
import type { Submission } from '../../domain/entities/Submission/Submission';
import './SubmissionsPage.css';

export const SubmissionsPage: React.FC = () => {
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

  useEffect(() => {
    const handleRefresh = () => {
      fetchSubmissions();
    };

    window.addEventListener('refreshSubmissions', handleRefresh);
    return () => {
      window.removeEventListener('refreshSubmissions', handleRefresh);
    };
  }, []);

  const handleEdit = (submission: Submission) => {
    window.location.hash = `#edit/${submission.id}`;
  };

  const handleDelete = async (submission: Submission) => {
    try {
      await apiService.deleteSubmission(submission.id);
      fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
    }
  };

  const handleRestore = async (submission: Submission) => {
    try {
      await apiService.restoreSubmission(submission.id);
      fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore submission');
    }
  };

  const activeSubmissions = submissions.filter((submission) => !submission.deletedAt);
  const deletedSubmissions = submissions.filter((submission) => !!submission.deletedAt);

  if (isLoading) {
    return (
      <div className="submissions-page">
        <h1>Submissions</h1>
        <div className="loading">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-page">
        <h1>Submissions</h1>
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
    <div className="submissions-page">
      <div className="submissions-header">
        <h1>Submissions</h1>
        <div className="submissions-header-buttons">
          <button onClick={() => { window.location.hash = '#'; }} className="create-button" title="Create new">
            <span className="create-icon">+</span>
            <span className="create-text">Create new</span>
          </button>
          <button onClick={fetchSubmissions} className="refresh-button" title="Refresh">
            <span className="refresh-icon">↻</span>
            <span className="refresh-text">Refresh</span>
          </button>
        </div>
      </div>

      {activeSubmissions.length === 0 ? (
        <div className="empty-state">No active submissions yet.</div>
      ) : (
        <div className="submissions-grid">
          {activeSubmissions.map((submission) => (
            <SubmissionItem
              key={submission.id}
              submission={submission}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {deletedSubmissions.length > 0 && (
        <div className="deleted-section">
          <h2>Deleted Submissions</h2>
          <div className="submissions-grid">
            {deletedSubmissions.map((submission) => (
              <SubmissionItem
                key={submission.id}
                submission={submission}
                onRestore={handleRestore}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
