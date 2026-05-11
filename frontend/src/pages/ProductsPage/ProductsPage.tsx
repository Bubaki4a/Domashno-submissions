import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import type { Product } from '../../domain/entities/Product/Product';
import type { ProviderInfo } from '../../presentation/responses/Provider/GetProvidersResponse';
import './ProductsPage.css';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    category: string;
    name: string;
    catalogNumber: string;
    providerId: string;
  }>({ category: '', name: '', catalogNumber: '', providerId: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getProducts({
        category: appliedFilters.category || undefined,
        name: appliedFilters.name || undefined,
        catalogNumber: appliedFilters.catalogNumber || undefined,
        providerId: appliedFilters.providerId || undefined,
      });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters.category, appliedFilters.name, appliedFilters.catalogNumber, appliedFilters.providerId]);

  useEffect(() => {
    apiService.getProviders().then(setProviders).catch(() => { });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (field: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
  };

  const goToEdit = (p: Product) => {
    const providerId = p.providerId || p.provider || '';
    if (providerId && p.id) {
      window.location.hash = `#products/edit/${encodeURIComponent(providerId)}/${encodeURIComponent(p.id)}`;
    }
  };

  if (error) {
    return (
      <div className="products-page">
        <h1>Products</h1>
        <div className="products-page-error">
          <p>{error}</p>
          <button type="button" onClick={fetchProducts} className="products-page-retry">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1>Products</h1>

      <form className="products-filters" onSubmit={handleApplyFilters}>
        <div className="filters-row">
          <label className="filter-label">
            <span>Category</span>
            <input
              type="text"
              value={filters.category}
              onChange={handleFilterChange('category')}
              placeholder="Filter by category"
              className="filter-input"
            />
          </label>
          <label className="filter-label">
            <span>Name</span>
            <input
              type="text"
              value={filters.name}
              onChange={handleFilterChange('name')}
              placeholder="Filter by name"
              className="filter-input"
            />
          </label>
          <label className="filter-label">
            <span>Catalog number</span>
            <input
              type="text"
              value={filters.catalogNumber}
              onChange={handleFilterChange('catalogNumber')}
              placeholder="SKU / catalog number"
              className="filter-input"
            />
          </label>
          <label className="filter-label">
            <span>Provider</span>
            <select
              value={filters.providerId}
              onChange={handleFilterChange('providerId')}
              className="filter-input"
            >
              <option value="">All</option>
              {providers.map((pr) => (
                <option key={pr.name} value={pr.name}>
                  {pr.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="filters-apply" disabled={isLoading}>
          Apply filters
        </button>
      </form>

      {isLoading ? (
        <div className="products-loading">Loading...</div>
      ) : (
        <>
          <p className="products-count">Total: {products.length} product(s)</p>
          {products.length === 0 ? (
            <div className="products-empty">No products found.</div>
          ) : (
            <div className="products-table-wrap">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Catalog number</th>
                    <th>Price</th>
                    <th>Provider</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={`${p.providerId ?? p.provider ?? ''}-${p.id}`}>
                      <td className="product-name">{p.name}</td>
                      <td>{p.category ?? '—'}</td>
                      <td>{p.sku ?? '—'}</td>
                      <td>{p.price != null ? `${Number(p.price).toFixed(2)}` : '—'}</td>
                      <td>{p.providerId ?? p.provider ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="product-edit-btn"
                          onClick={() => goToEdit(p)}
                          disabled={!p.providerId && !p.provider}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
