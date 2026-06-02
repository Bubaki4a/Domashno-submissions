-- Up migration: product_normalized_audience_emotion
-- Add audience and emotion columns to product_normalized for AI-generated product insights.

ALTER TABLE product_normalized
  ADD COLUMN IF NOT EXISTS audience TEXT NULL AFTER events,
  ADD COLUMN IF NOT EXISTS emotions TEXT NULL AFTER audience;
