-- Up migration: product_normalized_columns
-- Replace normalized_data JSON with explicit columns and migrate existing data.

-- 1. Create new table with column-based schema
CREATE TABLE IF NOT EXISTS product_normalized_new (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(128) NOT NULL,
  name VARCHAR(255) NULL,
  price DECIMAL(10,2) NULL,
  description TEXT NULL,
  image_url TEXT NULL,
  category VARCHAR(255) NULL,
  sku VARCHAR(255) NULL,
  stock INT NULL,
  provider VARCHAR(255) NULL,
  normalized_name VARCHAR(500) NULL,
  normalized_description TEXT NULL,
  normalized_category VARCHAR(255) NULL,
  metadata JSON NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_normalized_provider_product (provider_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Migrate existing rows from JSON to columns
INSERT INTO product_normalized_new (
  provider_id,
  product_id,
  name,
  price,
  description,
  image_url,
  category,
  sku,
  stock,
  provider,
  normalized_name,
  normalized_description,
  normalized_category,
  metadata
)
SELECT
  provider_id,
  product_id,
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.name')),
  CAST(JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.price')) AS DECIMAL(10,2)),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.description')),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.imageUrl')),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.category')),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.sku')),
  CAST(JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.stock')) AS SIGNED),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.provider')),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.normalizedName')),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.normalizedDescription')),
  JSON_UNQUOTE(JSON_EXTRACT(normalized_data, '$.normalizedCategory')),
  JSON_EXTRACT(normalized_data, '$.metadata')
FROM product_normalized;

-- 3. Drop old table and rename new one
DROP TABLE product_normalized;
RENAME TABLE product_normalized_new TO product_normalized;
