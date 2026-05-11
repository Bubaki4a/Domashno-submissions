import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IProductRepository } from '../../../src/infrastructure/providers/interfaces/IProductRepository';
import type { NormalizedProduct } from '../../../src/domain/entities/NormalizedProduct/NormalizedProduct';

const mockFindByAiStatus = vi.fn();
const mockSaveNormalized = vi.fn();
const mockUpdateAiStatus = vi.fn();
const mockFindNormalized = vi.fn();

const mockProductRepo: IProductRepository = {
  findByAiStatus: mockFindByAiStatus,
  saveNormalized: mockSaveNormalized,
  updateAiStatus: mockUpdateAiStatus,
  findNormalized: mockFindNormalized,
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  delete: vi.fn(),
  findAllNormalized: vi.fn(),
  findAllWithNormalized: vi.fn(),
  setAiStatusByProvider: vi.fn(),
  resetFailedAiStatus: vi.fn(),
};

const mockChatClient = {
  chat: vi.fn(),
};

const mockRunJob = vi.fn();

vi.mock('../../../src/infrastructure/repositories/repositoryFactory', () => ({
  createProductRepository: () => mockProductRepo,
}));

vi.mock('../../../src/infrastructure/ai/aiClientFactory', () => ({
  createChatCompletionClient: () => mockChatClient,
}));

vi.mock('../../../src/jobs/jobRunner', () => ({
  runJob: (opts: unknown) => mockRunJob(opts),
}));

vi.mock('../../../src/infrastructure/logging/jobLogger', () => ({
  logJob: vi.fn(),
  getPromptVersion: vi.fn(() => 'v1'),
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

describe('runEnrichJob', () => {
  it('calls runJob with jobName \"enrich\" and providerId from options', async () => {
    mockFindByAiStatus.mockResolvedValue([]);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    await runEnrichJob({ providerId: 'prov-123' });

    expect(mockRunJob).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: 'enrich',
        providerId: 'prov-123',
      }),
    );
  });

  it('calls runJob with providerId null when not provided', async () => {
    mockFindByAiStatus.mockResolvedValue([]);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    await runEnrichJob();

    expect(mockRunJob).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: 'enrich',
        providerId: null,
      }),
    );
  });

  it('passes batchSize to findByAiStatus via options', async () => {
    mockFindByAiStatus.mockResolvedValue([]);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    await runEnrichJob({ batchSize: 50 });

    expect(mockFindByAiStatus).toHaveBeenCalledWith('pending', undefined, 50);
  });

  it('passes providerId to findByAiStatus when provided', async () => {
    mockFindByAiStatus.mockResolvedValue([]);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    await runEnrichJob({ providerId: 'my-provider' });

    expect(mockFindByAiStatus).toHaveBeenCalledWith('pending', 'my-provider', expect.any(Number));
  });

  it('returns processedCount 0, successCount 0, failedCount 0 when no pending products', async () => {
    mockFindByAiStatus.mockResolvedValue([]);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    const result = await runEnrichJob();

    expect(result).toMatchObject({
      runId: 1,
      status: 'success',
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
    });
  });

  it('processes one pending product successfully: saveNormalized and updateAiStatus(completed)', async () => {
    const productId = 'p1';
    const providerId = 'prov1';
    mockFindByAiStatus.mockResolvedValue([{ id: productId, providerId }]);

    const normalizedProduct: NormalizedProduct = {
      id: productId,
      providerId,
      name: 'Test Product',
      normalizedName: 'Test Product',
    };
    mockFindNormalized.mockResolvedValue(normalizedProduct);
    mockChatClient.chat.mockResolvedValue('Trade show, Client gift, Launch event, Thank you, Award');
    mockSaveNormalized.mockResolvedValue(undefined);
    mockUpdateAiStatus.mockResolvedValue(undefined);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    const result = await runEnrichJob();

    expect(result).toMatchObject({
      runId: 1,
      status: 'success',
      processedCount: 1,
      successCount: 1,
      failedCount: 0,
    });
    expect(mockSaveNormalized).toHaveBeenCalledWith(
      providerId,
      productId,
      expect.objectContaining({
        ...normalizedProduct,
        events: expect.any(String),
      }),
    );
    expect(mockUpdateAiStatus).toHaveBeenCalledWith(providerId, productId, 'completed', null);
  });

  it('on enhance failure: updateAiStatus(failed, message) and counts 1 processed, 0 success, 1 failed', async () => {
    const productId = 'p1';
    const providerId = 'prov1';
    mockFindByAiStatus.mockResolvedValue([{ id: productId, providerId }]);
    mockFindNormalized.mockRejectedValue(new Error('AI service unavailable'));
    mockUpdateAiStatus.mockResolvedValue(undefined);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    const result = await runEnrichJob();

    expect(result).toMatchObject({
      runId: 1,
      status: 'success',
      processedCount: 1,
      successCount: 0,
      failedCount: 1,
    });
    expect(mockUpdateAiStatus).toHaveBeenCalledWith(providerId, productId, 'failed', 'AI service unavailable');
    expect(mockSaveNormalized).not.toHaveBeenCalled();
  });

  it('on non-Error throw: passes string message to updateAiStatus', async () => {
    const productId = 'p1';
    const providerId = 'prov1';
    mockFindByAiStatus.mockResolvedValue([{ id: productId, providerId }]);
    mockFindNormalized.mockRejectedValue('string error');
    mockUpdateAiStatus.mockResolvedValue(undefined);

    const { runEnrichJob } = await import('../../../src/jobs/enrichJob');
    const result = await runEnrichJob();

    expect(result.failedCount).toBe(1);
    expect(mockUpdateAiStatus).toHaveBeenCalledWith(providerId, productId, 'failed', 'string error');
  });
});

