import React, { useState, useEffect } from 'react';
import { Form } from '../../components/Form/Form';
import { apiService } from '../../services/api';
import type { Submission } from '../../domain/entities/Submission/Submission';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSubmissionFromHash = async () => {
      const hash = window.location.hash;
      const editMatch = hash.match(/^#edit\/(.+)$/);

      if (editMatch) {
        const submissionId = editMatch[1];
        setIsLoading(true);
        try {
          const submission = await apiService.getSubmissionById(submissionId);
          setEditingSubmission(submission);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        } catch (error) {
          console.error('Failed to load submission:', error);
          setEditingSubmission(null);
          window.location.hash = '';
        } finally {
          setIsLoading(false);
        }
      } else {
        setEditingSubmission(null);
      }
    };

    loadSubmissionFromHash();

    const handleHashChange = () => {
      loadSubmissionFromHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleFormSubmitSuccess = () => {
    window.dispatchEvent(new Event('refreshSubmissions'));
    setEditingSubmission(null);
    window.location.hash = '';
  };

  const handleCancelEdit = () => {
    setEditingSubmission(null);
    window.location.hash = '';
  };

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="loading">Loading submission...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Submit a Form</h1>
        <a href="#submissions" className="view-submissions-link">
          View All Submissions →
        </a>
      </div>
      <Form
        onSubmitSuccess={handleFormSubmitSuccess}
        editSubmission={editingSubmission}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};
