import type { IPipelineRunRepository } from '../infrastructure/jobs/interface/IPipelineRunRepository';
import { DatabasePipelineRunRepository } from '../infrastructure/jobs/database/DatabasePipelineRunRepository';
import { logJob } from '../infrastructure/logging/jobLogger';

export interface JobContext {
  runId: number;
  updateCounts(processed: number, success: number, failed: number): Promise<void>;
}

export interface JobResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
}

export interface RunJobOptions {
  jobName: string;
  providerId?: string | null;
  jobFn: (ctx: JobContext) => Promise<JobResult>;
}

export interface RunJobOutcome {
  runId: number;
  status: 'success' | 'failed';
  processedCount: number;
  successCount: number;
  failedCount: number;
  error?: string;
}

const pipelineRunRepository: IPipelineRunRepository = new DatabasePipelineRunRepository();

export async function runJob(options: RunJobOptions): Promise<RunJobOutcome> {
  const { jobName, providerId, jobFn } = options;

  const existing = await pipelineRunRepository.findRunningByJobName(jobName);
  if (existing) {
    throw new Error(
      `Job "${jobName}" is already running (run id ${existing.id}). Wait for it to finish or implement queue.`,
    );
  }

  const run = await pipelineRunRepository.create({
    jobName,
    providerId: providerId ?? null,
    status: 'running',
  });
  const runId = run.id;
  logJob({ job_name: jobName, run_id: runId, provider_id: providerId ?? undefined, message: 'job started' });

  const updateCounts = async (
    processed: number,
    success: number,
    failed: number,
  ): Promise<void> => {
    await pipelineRunRepository.update(runId, {
      processedCount: processed,
      successCount: success,
      failedCount: failed,
    });
  };

  const ctx: JobContext = { runId, updateCounts };

  try {
    const result = await jobFn(ctx);
    await pipelineRunRepository.update(runId, {
      status: 'success',
      finishedAt: new Date(),
      processedCount: result.processedCount,
      successCount: result.successCount,
      failedCount: result.failedCount,
    });
    logJob({
      job_name: jobName,
      run_id: runId,
      provider_id: providerId ?? undefined,
      message: 'job finished',
      status: 'success',
      processed_count: result.processedCount,
      success_count: result.successCount,
      failed_count: result.failedCount,
    });
    return {
      runId,
      status: 'success',
      processedCount: result.processedCount,
      successCount: result.successCount,
      failedCount: result.failedCount,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await pipelineRunRepository.update(runId, {
      status: 'failed',
      finishedAt: new Date(),
      error: errorMessage,
    });
    logJob({
      level: 'error',
      job_name: jobName,
      run_id: runId,
      provider_id: providerId ?? undefined,
      message: 'job failed',
      error: errorMessage,
    });
    return {
      runId,
      status: 'failed',
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      error: errorMessage,
    };
  }
}

export function getPipelineRunRepository(): IPipelineRunRepository {
  return pipelineRunRepository;
}
