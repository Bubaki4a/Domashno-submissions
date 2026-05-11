-- Up migration: products_ai_status
-- AI enrichment status and error tracking on products.

ALTER TABLE products
  ADD COLUMN ai_status VARCHAR(32) NULL DEFAULT 'pending',
  ADD COLUMN ai_updated_at DATETIME(6) NULL,
  ADD COLUMN ai_error TEXT NULL;

ALTER TABLE products
  ADD KEY idx_products_ai_status (ai_status);
