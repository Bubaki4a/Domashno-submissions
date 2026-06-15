import React, { useCallback, useEffect, useState } from 'react';
import { apiService, type ProductIssueRow } from '../../services/api';
import type { ProviderInfo } from '../../presentation/responses/Provider/GetProvidersResponse';
import './ProductsIssuesPage.css';

function issueCount(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return value ? 1 : 0;
}

function issueSummary(value: unknown): string[] {
  if (!Array.isArray(value)) {
    if (value == null) return [];
    if (typeof value === 'string') return [value];
    return [JSON.stringify(value)];
  }

  return value.slice(0, 3).map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const issue = item as { field?: string; message?: string; code?: string };
      const label = [issue.field, issue.code].filter(Boolean).join(' / ');
      return label ? `${label}: ${issue.message ?? JSON.stringify(item)}` : (issue.message ?? JSON.stringify(item));
    }
    return String(item);
  });
}

export const ProductsIssuesPage: React.FC = () => {
  const [products, setProducts] = useState<ProductIssueRow[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ providerId: string }>({ providerId: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getProductsWithIssues({
        providerId: appliedFilters.providerId || undefined,
        limit: 500,
      });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products with issues');
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters.providerId]);

  useEffect(() => {
    apiService.getProviders().then(setProviders).catch(() => { });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ providerId: e.target.value });
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
  };

  const goToEdit = (p: ProductIssueRow) => {
    if (p.providerId && p.id) {
      window.location.hash = `#products/edit/${encodeURIComponent(p.providerId)}/${encodeURIComponent(p.id)}`;
    }
  };

  const totalIssues = products.reduce((sum, product) => sum + issueCount(product.qualityIssues), 0);

  if (error) {
    return (
      <div className="products-issues-page">
        <div className="products-issues-hero">
          <h1>Products with issues</h1>
          <p>Products that failed data quality rules or still need cleanup.</p>
        </div>
        <div className="products-issues-error">
          <p>{error}</p>
          <button type="button" onClick={fetchProducts} className="products-issues-retry">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-issues-page">
      <div className="products-issues-hero">
        <div>
          <h1>Products with issues</h1>
          <p>Review data quality findings after import and AI enrichment.</p>
        </div>
        <div className="products-issues-summary">
          <div className="summary-card">
            <span className="summary-value">{products.length}</span>
            <span className="summary-label">Products</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{totalIssues}</span>
            <span className="summary-label">Issues</span>
          </div>
        </div>
      </div>

      <form className="products-issues-filters" onSubmit={handleApplyFilters}>
        <label className="issues-filter-label">
          <span>Provider</span>
          <select value={filters.providerId} onChange={handleFilterChange} className="issues-filter-input">
            <option value="">All</option>
            {providers.map((pr) => (
              <option key={pr.name} value={pr.name}>
                {pr.displayName}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="issues-filter-apply" disabled={isLoading}>
          Apply filters
        </button>
      </form>

      {isLoading ? (
        <div className="products-issues-loading">Loading...</div>
      ) : products.length === 0 ? (
        <div className="products-issues-empty">
          No products with issues were found.
        </div>
      ) : (
        <div className="products-issues-table-wrap">
          <table className="products-issues-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Issue summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const issues = issueSummary(product.qualityIssues);
                return (
                  <tr key={`${product.providerId}-${product.id}`}>
                    <td>
                      <div className="issues-product-name">{product.name}</div>
                      <div className="issues-product-meta">
                        {product.sku ?? '—'}
                        {product.category ? ` · ${product.category}` : ''}
                      </div>
                    </td>
                    <td>{product.providerId ?? product.provider ?? '—'}</td>
                    <td>
                      <span className={`issues-status issues-status-${product.qualityStatus ?? 'issues'}`}>
                        {product.qualityStatus ?? 'issues'}
                      </span>
                    </td>
                    <td>
                      {issues.length === 0 ? (
                        <span className="issues-empty-inline">No structured issues.</span>
                      ) : (
                        <ul className="issues-list">
                          {issues.map((issue, index) => (
                            <li key={`${product.providerId}-${product.id}-${index}`}>{issue}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="issues-edit-btn"
                        onClick={() => goToEdit(product)}
                        disabled={!product.providerId}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
