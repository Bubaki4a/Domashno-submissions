import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindRunningByJobName = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../../../src/infrastructure/jobs/database/DatabasePipelineRunRepository', () => ({
  DatabasePipelineRunRepository: vi.fn().mockImplementation(() => ({
    findRunningByJobName: mockFindRunningByJobName,
    create: mockCreate,
    update: mockUpdate,
    findById: vi.fn(),
    findAll: vi.fn(),
  })),
}));

vi.mock('../../../src/infrastructure/logging/jobLogger', () => ({
  logJob: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockFindRunningByJobName.mockResolvedValue(null);
  mockCreate.mockResolvedValue({ id: 1, jobName: 'test', providerId: null, status: 'running', startedAt: new Date(), finishedAt: null, processedCount: 0, successCount: 0, failedCount: 0, error: null, metadata: null });
  mockUpdate.mockResolvedValue(undefined);
});

describe('runJob', () => {
  it('throws when job with same name is already running', async () => {
    mockFindRunningByJobName.mockResolvedValue({ id: 99, jobName: 'enrich', providerId: null, status: 'running', startedAt: new Date(), finishedAt: null, processedCount: 0, successCount: 0, failedCount: 0, error: null, metadata: null });

    const { runJob } = await import('../../../src/jobs/jobRunner');

    await expect(runJob({
      jobName: 'enrich',
      jobFn: async () => ({ processedCount: 0, successCount: 0, failedCount: 0 }),
    })).rejects.toThrow(/already running.*run id 99/);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates run, invokes jobFn, updates with success and returns outcome', async () => {
    const { runJob } = await import('../../../src/jobs/jobRunner');

    const result = await runJob({
      jobName: 'enrich',
      providerId: 'prov1',
      jobFn: async (ctx) => {
        await ctx.updateCounts(2, 1, 1);
        return { processedCount: 2, successCount: 1, failedCount: 1 };
      },
    });

    expect(mockFindRunningByJobName).toHaveBeenCalledWith('enrich');
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ jobName: 'enrich', providerId: 'prov1', status: 'running' }));
    expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
      status: 'success',
      processedCount: 2,
      successCount: 1,
      failedCount: 1,
    }));
    expect(result).toEqual({
      runId: 1,
      status: 'success',
      processedCount: 2,
      successCount: 1,
      failedCount: 1,
    });
  });

  it('when jobFn throws: updates with status failed and returns failed outcome', async () => {
    const { runJob } = await import('../../../src/jobs/jobRunner');

    const result = await runJob({
      jobName: 'import',
      jobFn: async () => {
        throw new Error('DB connection lost');
      },
    });

    expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
      status: 'failed',
      error: 'DB connection lost',
    }));
    expect(result).toMatchObject({
      runId: 1,
      status: 'failed',
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      error: 'DB connection lost',
    });
  });

  it('when jobFn throws non-Error: stringifies and passes as error', async () => {
    const { runJob } = await import('../../../src/jobs/jobRunner');

    const result = await runJob({
      jobName: 'sync',
      jobFn: async () => {
        throw 'string throw';
      },
    });

    expect(result.error).toBe('string throw');
    expect(mockUpdate).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'failed', error: 'string throw' }));
  });
});

