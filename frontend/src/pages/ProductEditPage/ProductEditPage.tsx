import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Product } from '../../domain/entities/Product/Product';
import './ProductEditPage.css';

function parseEditHash(): { providerId: string; id: string } | null {
  const hash = window.location.hash;
  const m = hash.match(/^#products\/edit\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { providerId: decodeURIComponent(m[1]), id: decodeURIComponent(m[2]) };
}

export const ProductEditPage: React.FC = () => {
  const [params, setParams] = useState<{ providerId: string; id: string } | null>(() => parseEditHash());
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    sku: '',
    stock: '',
    normalizedName: '',
    normalizedDescription: '',
    normalizedCategory: '',
    events: '',
    audience: '',
    emotion: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingEvents, setIsGeneratingEvents] = useState(false);
  const [isGeneratingAudience, setIsGeneratingAudience] = useState(false);
  const [isGeneratingEmotion, setIsGeneratingEmotion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const onHash = () => setParams(parseEditHash());
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!params?.providerId || !params?.id) {
      setIsLoading(false);
      setError('Missing provider or product ID.');
      return;
    }
    setError(null);
    setIsLoading(true);
    apiService
      .getProduct(params.providerId, params.id)
      .then((p) => {
        setProduct(p);
        setForm({
          name: p.name ?? '',
          price: p.price != null ? String(p.price) : '',
          description: p.description ?? '',
          imageUrl: p.imageUrl ?? '',
          category: p.category ?? '',
          sku: p.sku ?? '',
          stock: p.stock != null ? String(p.stock) : '',
          normalizedName: p.normalizedName ?? '',
          normalizedDescription: p.normalizedDescription ?? '',
          normalizedCategory: p.normalizedCategory ?? '',
          events: p.events ?? '',
          audience: p.audience ?? '',
          emotion: p.emotion ?? '',
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error loading'))
      .finally(() => setIsLoading(false));
  }, [params?.providerId, params?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveMessage(null);
  };

  const goBack = () => {
    window.location.hash = '#products';
  };

  const handleGenerateEvents = async () => {
    if (!params?.providerId || !params?.id) return;
    setIsGeneratingEvents(true);
    setSaveMessage(null);
    try {
      const enhanced = await apiService.generateProductEvents(params.providerId, params.id);
      setProduct(enhanced);
      setForm((prev) => ({ ...prev, events: enhanced.events ?? '' }));
      setSaveMessage({ type: 'success', text: 'Events generated. Review and click Save to store them.' });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to generate events',
      });
    } finally {
      setIsGeneratingEvents(false);
    }
  };

  const handleGenerateAudience = async () => {
    if (!params?.providerId || !params?.id) return;
    setIsGeneratingAudience(true);
    setSaveMessage(null);
    try {
      const enhanced = await apiService.generateProductAudience(params.providerId, params.id);
      setProduct(enhanced);
      setForm((prev) => ({ ...prev, audience: enhanced.audience ?? '' }));
      setSaveMessage({ type: 'success', text: 'Audience generated. Review and click Save to store it.' });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to generate audience',
      });
    } finally {
      setIsGeneratingAudience(false);
    }
  };

  const handleGenerateEmotion = async () => {
    if (!params?.providerId || !params?.id) return;
    setIsGeneratingEmotion(true);
    setSaveMessage(null);
    try {
      const enhanced = await apiService.generateProductEmotion(params.providerId, params.id);
      setProduct(enhanced);
      setForm((prev) => ({ ...prev, emotion: enhanced.emotion ?? '' }));
      setSaveMessage({ type: 'success', text: 'Emotion generated. Review and click Save to store it.' });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to generate emotion',
      });
    } finally {
      setIsGeneratingEmotion(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params?.providerId || !params?.id) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updated = await apiService.updateProduct(params.providerId, params.id, {
        name: form.name.trim() || undefined,
        price: form.price.trim() ? Number(form.price) : undefined,
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        category: form.category.trim() || undefined,
        sku: form.sku.trim() || undefined,
        stock: form.stock.trim() ? Number(form.stock) : undefined,
        normalizedName: form.normalizedName.trim() || undefined,
        normalizedDescription: form.normalizedDescription.trim() || undefined,
        normalizedCategory: form.normalizedCategory.trim() || undefined,
        events: form.events.trim() || undefined,
        audience: form.audience.trim() || undefined,
        emotion: form.emotion.trim() || undefined,
      });
      setSaveMessage({ type: 'success', text: 'Product saved successfully.' });
      setProduct(updated);
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error saving',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="product-edit-page">
        <h1>Edit product</h1>
        <div className="product-edit-loading">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-edit-page">
        <h1>Edit product</h1>
        <div className="product-edit-error">
          <p>{error ?? 'Product not found.'}</p>
          <button type="button" onClick={goBack} className="product-edit-back">
            Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-edit-page">
      <div className="product-edit-header">
        <h1>Edit product</h1>
        <button type="button" onClick={goBack} className="product-edit-back">
          Back to products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-edit-form">
        <div className="product-edit-field">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="product-edit-input"
          />
        </div>
        <div className="product-edit-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            value={form.category}
            onChange={handleChange}
            className="product-edit-input"
          />
        </div>
        <div className="product-edit-field">
          <label htmlFor="sku">Catalog number (SKU)</label>
          <input
            id="sku"
            name="sku"
            type="text"
            value={form.sku}
            onChange={handleChange}
            className="product-edit-input"
          />
        </div>
        <div className="product-edit-row">
          <div className="product-edit-field">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="product-edit-input"
            />
          </div>
          <div className="product-edit-field">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              className="product-edit-input"
            />
          </div>
        </div>
        <div className="product-edit-field">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            className="product-edit-input"
          />
        </div>
        <div className="product-edit-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="product-edit-input product-edit-textarea"
          />
        </div>

        <div className="product-edit-field">
          <label htmlFor="normalizedName">Normalized name</label>
          <input
            id="normalizedName"
            name="normalizedName"
            type="text"
            value={form.normalizedName}
            onChange={handleChange}
            className="product-edit-input"
          />
        </div>
        <div className="product-edit-field">
          <label htmlFor="normalizedCategory">Normalized category</label>
          <input
            id="normalizedCategory"
            name="normalizedCategory"
            type="text"
            value={form.normalizedCategory}
            onChange={handleChange}
            className="product-edit-input"
          />
        </div>
        <div className="product-edit-field">
          <label htmlFor="normalizedDescription">Normalized description</label>
          <textarea
            id="normalizedDescription"
            name="normalizedDescription"
            value={form.normalizedDescription}
            onChange={handleChange}
            rows={4}
            className="product-edit-input product-edit-textarea"
          />
        </div>

        <div className="product-edit-field product-edit-enhance-row">
          <label>Events (merchant gift use)</label>
          <textarea
            id="events"
            name="events"
            value={form.events}
            onChange={handleChange}
            rows={5}
            placeholder="Use “Generate events” to get 5 event ideas with AI."
            className="product-edit-input product-edit-textarea"
          />
          <button
            type="button"
            onClick={handleGenerateEvents}
            disabled={isGeneratingEvents}
            className="product-edit-enhance-btn"
          >
            {isGeneratingEvents ? 'Generating…' : 'Generate events'}
          </button>
        </div>

        <div className="product-edit-field product-edit-enhance-row">
          <label>Audience</label>
          <textarea
            id="audience"
            name="audience"
            value={form.audience}
            onChange={handleChange}
            rows={3}
            placeholder="Use “Generate audience” to get 5 audience segments with AI."
            className="product-edit-input product-edit-textarea"
          />
          <button
            type="button"
            onClick={handleGenerateAudience}
            disabled={isGeneratingAudience}
            className="product-edit-enhance-btn"
          >
            {isGeneratingAudience ? 'Generating…' : 'Generate audience'}
          </button>
        </div>

        <div className="product-edit-field product-edit-enhance-row">
          <label>Emotion</label>
          <textarea
            id="emotion"
            name="emotion"
            value={form.emotion}
            onChange={handleChange}
            rows={3}
            placeholder="Use “Generate emotion” to get 5 emotions with AI."
            className="product-edit-input product-edit-textarea"
          />
          <button
            type="button"
            onClick={handleGenerateEmotion}
            disabled={isGeneratingEmotion}
            className="product-edit-enhance-btn"
          >
            {isGeneratingEmotion ? 'Generating…' : 'Generate emotion'}
          </button>
        </div>

        {saveMessage && (
          <div className={`product-edit-message ${saveMessage.type}`}>
            {saveMessage.text}
          </div>
        )}

        <div className="product-edit-actions">
          <button type="button" onClick={goBack} className="product-edit-cancel">
            Cancel
          </button>
          <button type="submit" className="product-edit-submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
