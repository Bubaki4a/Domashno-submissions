export type PipelineRunStatus = 'pending' | 'running' | 'success' | 'failed';

export interface PipelineRun {
  id: number;
  jobName: string;
  providerId: string | null;
  status: PipelineRunStatus;
  startedAt: Date;
  finishedAt: Date | null;
  processedCount: number;
  successCount: number;
  failedCount: number;
  error: string | null;
  metadata: Record<string, unknown> | null;
}

export interface CreatePipelineRunInput {
  jobName: string;
  providerId?: string | null;
  status: PipelineRunStatus;
}

export interface UpdatePipelineRunInput {
  status?: PipelineRunStatus;
  finishedAt?: Date | null;
  processedCount?: number;
  successCount?: number;
  failedCount?: number;
  error?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ListPipelineRunsFilters {
  jobName?: string;
  status?: PipelineRunStatus;
  limit?: number;
}
