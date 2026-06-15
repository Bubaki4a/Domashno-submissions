-- Up migration: products_quality
-- Data quality tracking for imported and AI-enriched products.

ALTER TABLE products
  ADD COLUMN quality_status VARCHAR(32) NULL DEFAULT NULL,
  ADD COLUMN quality_issues JSON NULL;

ALTER TABLE products
  ADD KEY idx_products_quality_status (quality_status);