import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindProductsForQualityCheck = vi.fn();
const mockMarkProductQuality = vi.fn();
const mockRunJob = vi.fn();

vi.mock('../../../src/infrastructure/repositories/repositoryFactory', () => ({
  createProductRepository: () => ({
    findProductsForQualityCheck: mockFindProductsForQualityCheck,
    markProductQuality: mockMarkProductQuality,
    findProductsWithQualityIssues: vi.fn(),
    findByAiStatus: vi.fn(),
    updateAiStatus: vi.fn(),
    save: vi.fn(),
    findById: vi.fn(),
    deleteNormalized: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    findAllNormalized: vi.fn(),
    findAllWithNormalized: vi.fn(),
    setAiStatusByProvider: vi.fn(),
    resetFailedAiStatus: vi.fn(),
    saveNormalized: vi.fn(),
    findNormalized: vi.fn(),
  }),
}));

vi.mock('../../../src/jobs/jobRunner', () => ({
  runJob: (opts: unknown) => mockRunJob(opts),
}));

vi.mock('../../../src/infrastructure/logging/jobLogger', () => ({
  logJob: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockRunJob.mockImplementation(async (opts: { jobFn: (ctx: { runId: number; updateCounts: (p: number, s: number, f: number) => Promise<void> }) => Promise<{ processedCount: number; successCount: number; failedCount: number }> }) => {
    const ctx = { runId: 1, updateCounts: vi.fn().mockResolvedValue(undefined) };
    const result = await opts.jobFn(ctx);
    return {
      runId: 1,
      status: 'success' as const,
      processedCount: result.processedCount,
      successCount: result.successCount,
      failedCount: result.failedCount,
    };
  });
});

describe('runDataQualityJob', () => {
  it('calls runJob with jobName "data_quality" and forwards options', async () => {
    mockFindProductsForQualityCheck.mockResolvedValue([]);

    const { runDataQualityJob } = await import('../../../src/jobs/dataQualityJob');
    await runDataQualityJob({ providerId: 'prov-123', batchSize: 12 });

    expect(mockRunJob).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: 'data_quality',
        providerId: 'prov-123',
      }),
    );
    expect(mockFindProductsForQualityCheck).toHaveBeenCalledWith('prov-123', 12);
  });

  it('marks invalid product with quality issues', async () => {
    mockFindProductsForQualityCheck.mockResolvedValue([
      {
        id: 'p1',
        providerId: 'prov1',
        name: '',
        description: '',
        category: '',
        sku: '',
        price: 0,
        normalizedName: '',
        normalizedDescription: '',
        events: '',
        audience: '',
        emotion: '',
      },
    ]);
    mockMarkProductQuality.mockResolvedValue(undefined);

    const { runDataQualityJob } = await import('../../../src/jobs/dataQualityJob');
    const result = await runDataQualityJob();

    expect(result).toMatchObject({
      runId: 1,
      status: 'success',
      processedCount: 1,
      successCount: 1,
      failedCount: 0,
    });
    expect(mockMarkProductQuality).toHaveBeenCalledWith(
      'prov1',
      'p1',
      'issues',
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'description' }),
        expect.objectContaining({ field: 'category' }),
        expect.objectContaining({ field: 'sku' }),
        expect.objectContaining({ field: 'price' }),
      ]),
    );
  });

  it('continues when a product update fails', async () => {
    mockFindProductsForQualityCheck.mockResolvedValue([
      {
        id: 'p1',
        providerId: 'prov1',
        name: 'Alpha',
        description: 'Alpha description',
        category: 'cat',
        sku: 'sku-1',
        price: 10,
        normalizedName: 'Alpha',
        normalizedDescription: 'Alpha description',
        events: 'Event 1',
        audience: 'Audience 1',
        emotion: 'Emotion 1',
      },
      {
        id: 'p2',
        providerId: 'prov1',
        name: 'Beta',
        description: 'Beta description',
        category: 'cat',
        sku: 'sku-2',
        price: 11,
        normalizedName: 'Beta',
        normalizedDescription: 'Beta description',
        events: 'Event 2',
        audience: 'Audience 2',
        emotion: 'Emotion 2',
      },
    ]);
    mockMarkProductQuality
      .mockRejectedValueOnce(new Error('db error'))
      .mockResolvedValueOnce(undefined);

    const { runDataQualityJob } = await import('../../../src/jobs/dataQualityJob');
    const result = await runDataQualityJob();

    expect(result).toMatchObject({
      processedCount: 2,
      successCount: 1,
      failedCount: 1,
    });
    expect(mockMarkProductQuality).toHaveBeenCalledTimes(2);
  });
});