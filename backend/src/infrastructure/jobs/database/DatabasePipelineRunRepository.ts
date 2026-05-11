import { ResultSetHeader } from 'mysql2';
import { databaseClient } from '../../database/databaseClient';
import type { IPipelineRunRepository } from '../interface/IPipelineRunRepository';
import type {
  PipelineRun,
  CreatePipelineRunInput,
  UpdatePipelineRunInput,
  ListPipelineRunsFilters,
} from '../../../domain/entities/PipelineRun/PipelineRun';

const TABLE = 'pipeline_runs';

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function rowToPipelineRun(row: Record<string, unknown>): PipelineRun {
  return {
    id: Number(row.id),
    jobName: String(row.job_name),
    providerId: row.provider_id != null ? String(row.provider_id) : null,
    status: row.status as PipelineRun['status'],
    startedAt: toDate(row.started_at as Date | string),
    finishedAt: row.finished_at != null ? toDate(row.finished_at as Date | string) : null,
    processedCount: Number(row.processed_count),
    successCount: Number(row.success_count),
    failedCount: Number(row.failed_count),
    error: row.error != null ? String(row.error) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
  };
}

export class DatabasePipelineRunRepository implements IPipelineRunRepository {
  async create(input: CreatePipelineRunInput): Promise<PipelineRun> {
    const pool = databaseClient.getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO ${TABLE} (job_name, provider_id, status, started_at, processed_count, success_count, failed_count, error, metadata)
       VALUES (?, ?, ?, NOW(6), 0, 0, 0, NULL, NULL)`,
      [input.jobName, input.providerId ?? null, input.status],
    );
    const run = await this.findById(result.insertId);
    if (!run) throw new Error('Failed to create pipeline run');
    return run;
  }

  async update(id: number, input: UpdatePipelineRunInput): Promise<void> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.finishedAt !== undefined) {
      updates.push('finished_at = ?');
      values.push(input.finishedAt);
    }
    if (input.processedCount !== undefined) {
      updates.push('processed_count = ?');
      values.push(input.processedCount);
    }
    if (input.successCount !== undefined) {
      updates.push('success_count = ?');
      values.push(input.successCount);
    }
    if (input.failedCount !== undefined) {
      updates.push('failed_count = ?');
      values.push(input.failedCount);
    }
    if (input.error !== undefined) {
      updates.push('error = ?');
      values.push(input.error);
    }
    if (input.metadata !== undefined) {
      updates.push('metadata = ?');
      values.push(input.metadata ? JSON.stringify(input.metadata) : null);
    }

    if (updates.length === 0) return;

    values.push(id);
    await databaseClient.query(
      `UPDATE ${TABLE} SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );
  }

  async findById(id: number): Promise<PipelineRun | null> {
    const rows = await databaseClient.query<Record<string, unknown>>(
      `SELECT id, job_name, provider_id, status, started_at, finished_at,
              processed_count, success_count, failed_count, error, metadata
       FROM ${TABLE} WHERE id = ? LIMIT 1`,
      [id],
    );
    if (!rows.length) return null;
    return rowToPipelineRun(rows[0]);
  }

  async findAll(filters?: ListPipelineRunsFilters): Promise<PipelineRun[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.jobName) {
      conditions.push('job_name = ?');
      params.push(filters.jobName);
    }
    if (filters?.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters?.limit != null ? Math.max(1, Math.min(500, filters.limit)) : 100;
    const sql = `SELECT id, job_name, provider_id, status, started_at, finished_at,
                        processed_count, success_count, failed_count, error, metadata
                 FROM ${TABLE} ${where} ORDER BY started_at DESC LIMIT ?`;
    const rows = await databaseClient.query<Record<string, unknown>>(sql, [...params, limit]);
    return rows.map(rowToPipelineRun);
  }

  async findRunningByJobName(jobName: string): Promise<PipelineRun | null> {
    const rows = await databaseClient.query<Record<string, unknown>>(
      `SELECT id, job_name, provider_id, status, started_at, finished_at,
              processed_count, success_count, failed_count, error, metadata
       FROM ${TABLE} WHERE job_name = ? AND status = 'running' LIMIT 1`,
      [jobName],
    );
    if (!rows.length) return null;
    return rowToPipelineRun(rows[0]);
  }
}
