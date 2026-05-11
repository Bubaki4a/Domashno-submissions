-- Up migration: pipeline_runs
-- Job execution tracking for pipeline (import, enrich).

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_name VARCHAR(64) NOT NULL,
  provider_id VARCHAR(64) NULL,
  status VARCHAR(32) NOT NULL,
  started_at DATETIME(6) NOT NULL,
  finished_at DATETIME(6) NULL,
  processed_count INT UNSIGNED NOT NULL DEFAULT 0,
  success_count INT UNSIGNED NOT NULL DEFAULT 0,
  failed_count INT UNSIGNED NOT NULL DEFAULT 0,
  error TEXT NULL,
  metadata JSON NULL,
  PRIMARY KEY (id),
  KEY idx_pipeline_runs_job_name (job_name),
  KEY idx_pipeline_runs_status (status),
  KEY idx_pipeline_runs_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
