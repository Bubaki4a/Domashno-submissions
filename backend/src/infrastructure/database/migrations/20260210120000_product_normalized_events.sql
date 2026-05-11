-- Up migration: product_normalized_events
-- Add events column (AI-generated merchant gift events) to product_normalized.

ALTER TABLE product_normalized
  ADD COLUMN events TEXT NULL
  AFTER metadata;
