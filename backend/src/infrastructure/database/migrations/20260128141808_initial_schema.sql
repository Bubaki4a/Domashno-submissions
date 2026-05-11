-- Up migration: initial_schema

-- MySQL schema for SoMerch Product Optimizer
-- Adjust engine/charset according to your setup if needed.

CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_submissions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(128) NOT NULL,
  provider_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NULL,
  description TEXT NULL,
  image_url TEXT NULL,
  category VARCHAR(255) NULL,
  sku VARCHAR(255) NULL,
  stock INT NULL,
  provider VARCHAR(255) NULL,
  provider_data JSON NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id, provider_id),
  KEY idx_products_provider (provider_id),
  KEY idx_products_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_normalized (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(128) NOT NULL,
  normalized_data JSON NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_normalized_provider_product (provider_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS provider_sources (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id VARCHAR(64) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  timestamp DATETIME(6) NOT NULL,
  products JSON NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_provider_sources_provider_filename (provider_id, filename),
  KEY idx_provider_sources_provider (provider_id),
  KEY idx_provider_sources_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

