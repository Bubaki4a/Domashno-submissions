import React, { useState, useEffect } from 'react';
import { apiService, type PipelineRun, type FailedProductRow } from '../../services/api';
import './JobsPage.css';

export const JobsPage: React.FC = () => {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [failedProducts, setFailedProducts] = useState<FailedProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedLoading, setFailedLoading] = useState(true);
  const [error, setError] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [lastTriggerMessage, setLastTriggerMessage] = useState<{ type: 'import' | 'enrich'; success: boolean; text: string } | null>(null);

  const loadRuns = async () => {
    setError('');
    try {
      const data = await apiService.getJobs({ limit: 50 });
      setRuns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job runs');
    } finally {
      setLoading(false);
    }
  };

  const loadFailedProducts = async () => {
    try {
      const data = await apiService.getFailedProducts();
      setFailedProducts(data);
    } catch {
      setFailedProducts([]);
    } finally {
      setFailedLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  useEffect(() => {
    loadFailedProducts();
  }, []);

  const handleTriggerImport = async () => {
    setImportLoading(true);
    setLastTriggerMessage(null);
    setError('');
    try {
      const res = await apiService.triggerImportJob();
      setLastTriggerMessage({
        type: 'import',
        success: res.success,
        text: res.success
          ? `Run #${res.runId}: ${res.processedCount} processed, ${res.successCount} success, ${res.failedCount} failed`
          : (res.error ?? `Run #${res.runId} failed`),
      });
      await loadRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import job failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleTriggerEnrich = async () => {
    setEnrichLoading(true);
    setLastTriggerMessage(null);
    setError('');
    try {
      const res = await apiService.triggerEnrichJob();
      setLastTriggerMessage({
        type: 'enrich',
        success: res.success,
        text: res.success
          ? `Run #${res.runId}: ${res.processedCount} processed, ${res.successCount} success, ${res.failedCount} failed`
          : (res.error ?? `Run #${res.runId} failed`),
      });
      await loadRuns();
      await loadFailedProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrich job failed');
    } finally {
      setEnrichLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    setRetryLoading(true);
    setError('');
    try {
      const res = await apiService.retryFailedProducts();
      setLastTriggerMessage({
        type: 'enrich',
        success: true,
        text: `${res.resetCount} product(s) reset to pending. Run Enrich to process them.`,
      });
      await loadFailedProducts();
      await loadRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed');
    } finally {
      setRetryLoading(false);
    }
  };

  const formatDate = (s: string | null) => {
    if (!s) return '—';
    try {
      return new Date(s).toLocaleString();
    } catch {
      return s;
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'success': return 'jobs-status-success';
      case 'failed': return 'jobs-status-failed';
      case 'running': return 'jobs-status-running';
      default: return 'jobs-status-pending';
    }
  };

  return (
    <div className="jobs-page">
      <h1>Pipeline Jobs</h1>
      {error && <div className="jobs-error">{error}</div>}
      {lastTriggerMessage && (
        <div className={`jobs-message ${lastTriggerMessage.success ? 'jobs-message-success' : 'jobs-message-error'}`}>
          {lastTriggerMessage.text}
        </div>
      )}

      <section className="jobs-section">
        <h2>Trigger jobs</h2>
        <div className="jobs-trigger-actions">
          <button
            type="button"
            className="jobs-btn jobs-btn-import"
            onClick={handleTriggerImport}
            disabled={importLoading}
          >
            {importLoading ? 'Running…' : 'Run import'}
          </button>
          <button
            type="button"
            className="jobs-btn jobs-btn-enrich"
            onClick={handleTriggerEnrich}
            disabled={enrichLoading}
          >
            {enrichLoading ? 'Running…' : 'Run enrich'}
          </button>
        </div>
        <p className="jobs-hint">Import fetches supplier data and marks products for AI. Enrich processes pending products with AI.</p>
      </section>

      <section className="jobs-section">
        <h2>Recent runs</h2>
        {loading ? (
          <p className="jobs-loading">Loading…</p>
        ) : (
          <div className="jobs-table-wrap">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Job</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Processed</th>
                  <th>Success</th>
                  <th>Failed</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="jobs-empty">No runs yet</td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr key={run.id}>
                      <td>{run.id}</td>
                      <td>{run.jobName}</td>
                      <td>{run.providerId ?? '—'}</td>
                      <td><span className={statusClass(run.status)}>{run.status}</span></td>
                      <td>{formatDate(run.startedAt)}</td>
                      <td>{run.processedCount}</td>
                      <td>{run.successCount}</td>
                      <td>{run.failedCount}</td>
                      <td className="jobs-error-cell">{run.error ? run.error.slice(0, 80) + (run.error.length > 80 ? '…' : '') : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="jobs-section">
        <h2>Failed products (AI)</h2>
        {failedLoading ? (
          <p className="jobs-loading">Loading…</p>
        ) : (
          <>
            <p className="jobs-failed-count">
              {failedProducts.length} product(s) with <code>ai_status = failed</code>.
            </p>
            {failedProducts.length > 0 && (
              <div className="jobs-failed-actions">
                <button
                  type="button"
                  className="jobs-btn jobs-btn-retry"
                  onClick={handleRetryFailed}
                  disabled={retryLoading}
                >
                  {retryLoading ? 'Resetting…' : 'Retry failed (reset to pending)'}
                </button>
              </div>
            )}
            {failedProducts.length > 0 && (
              <div className="jobs-table-wrap jobs-failed-table">
                <table className="jobs-table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Product ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedProducts.map((p) => (
                      <tr key={`${p.providerId}-${p.id}`}>
                        <td>{p.providerId}</td>
                        <td>{p.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
