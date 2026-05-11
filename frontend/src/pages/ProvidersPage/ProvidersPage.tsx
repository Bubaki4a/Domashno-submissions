import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { ProviderInfo } from '../../presentation/responses/Provider/GetProvidersResponse';
import type { SyncProviderResponse } from '../../presentation/responses/Provider/SyncProviderResponse';
import type { NormalizeProductsResponse } from '../../presentation/responses/Provider/NormalizeProductsResponse';
import './ProvidersPage.css';

export const ProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<Record<string, {
    type: 'fetch' | 'normalize' | null;
    message: string;
    isSuccess: boolean;
    isLoading: boolean;
  }>>({});

  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleFetch = async (providerName: string) => {
    setOperationStatus(prev => ({
      ...prev,
      [providerName]: {
        type: 'fetch',
        message: '',
        isSuccess: false,
        isLoading: true,
      },
    }));

    try {
      const response: SyncProviderResponse = await apiService.syncProvider(providerName);

      setOperationStatus(prev => ({
        ...prev,
        [providerName]: {
          type: 'fetch',
          message: response.success
            ? `Successfully fetched ${response.processedCount} products`
            : `Fetched with ${response.errors.length} error(s):\n${(response.errors || []).join('\n')}`,
          isSuccess: response.success,
          isLoading: false,
        },
      }));

      // Refresh providers list to update counts
      await fetchProviders();
    } catch (err) {
      setOperationStatus(prev => ({
        ...prev,
        [providerName]: {
          type: 'fetch',
          message: err instanceof Error ? err.message : 'Failed to fetch products',
          isSuccess: false,
          isLoading: false,
        },
      }));
    }
  };

  const handleNormalize = async (providerName: string) => {
    setOperationStatus(prev => ({
      ...prev,
      [providerName]: {
        type: 'normalize',
        message: '',
        isSuccess: false,
        isLoading: true,
      },
    }));

    try {
      const response: NormalizeProductsResponse = await apiService.normalizeProducts(providerName);

      setOperationStatus(prev => ({
        ...prev,
        [providerName]: {
          type: 'normalize',
          message: response.success
            ? `Successfully normalized ${response.processedCount} products`
            : `Normalized with ${response.errors.length} error(s):\n${(response.errors || []).join('\n')}`,
          isSuccess: response.success,
          isLoading: false,
        },
      }));
    } catch (err) {
      setOperationStatus(prev => ({
        ...prev,
        [providerName]: {
          type: 'normalize',
          message: err instanceof Error ? err.message : 'Failed to normalize products',
          isSuccess: false,
          isLoading: false,
        },
      }));
    }
  };

  const getStatusForProvider = (providerName: string) => {
    return operationStatus[providerName] || {
      type: null,
      message: '',
      isSuccess: false,
      isLoading: false,
    };
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="providers-page">
        <h1>Providers</h1>
        <div className="loading">Loading providers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="providers-page">
        <h1>Providers</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProviders} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="providers-page">
      <h1>Providers</h1>

      {providers.length === 0 ? (
        <div className="no-providers">
          <p>No providers configured.</p>
        </div>
      ) : (
        <div className="providers-list">
          {providers.map((provider) => {
            const status = getStatusForProvider(provider.name);

            return (
              <div key={provider.name} className="provider-item">
                <div className="provider-header">
                  <h2>{provider.displayName}</h2>
                  <span className={`provider-status ${provider.isConfigured ? 'configured' : 'not-configured'}`}>
                    {provider.isConfigured ? '✓ Configured' : '✗ Not Configured'}
                  </span>
                </div>

                <div className="provider-info">
                  <div className="info-item">
                    <span className="info-label">Last Sync:</span>
                    <span className="info-value">{formatDate(provider.lastSync)}</span>
                  </div>
                  {provider.productsCount !== undefined && (
                    <div className="info-item">
                      <span className="info-label">Products:</span>
                      <span className="info-value">{provider.productsCount}</span>
                    </div>
                  )}
                </div>

                <div className="provider-actions">
                  <button
                    onClick={() => handleFetch(provider.name)}
                    disabled={!provider.isConfigured || status.isLoading}
                    className="action-button fetch-button"
                  >
                    {status.type === 'fetch' && status.isLoading ? 'Fetching...' : 'Fetch'}
                  </button>
                  <button
                    onClick={() => handleNormalize(provider.name)}
                    disabled={status.isLoading}
                    className="action-button normalize-button"
                  >
                    {status.type === 'normalize' && status.isLoading ? 'Normalizing...' : 'Normalize'}
                  </button>
                </div>

                {status.message && (
                  <div className={`operation-message ${status.isSuccess ? 'success' : 'error'}`}>
                    {status.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
