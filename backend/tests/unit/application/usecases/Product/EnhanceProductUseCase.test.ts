import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IProductRepository } from '../../../../../src/infrastructure/providers/interfaces/IProductRepository';
import type { IChatCompletionClient } from '../../../../../src/domain/ai/IChatCompletionClient';
import type { NormalizedProduct } from '../../../../../src/domain/entities/NormalizedProduct/NormalizedProduct';
import { EnhanceProductUseCase } from '../../../../../src/application/usecases/Product/EnhanceProductUseCase';

const mockFindNormalized = vi.fn();
const mockChat = vi.fn();

const mockProductRepo: IProductRepository = {
  findNormalized: mockFindNormalized,
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  delete: vi.fn(),
  saveNormalized: vi.fn(),
  findAllNormalized: vi.fn(),
  findAllWithNormalized: vi.fn(),
  findByAiStatus: vi.fn(),
  updateAiStatus: vi.fn(),
  setAiStatusByProvider: vi.fn(),
  resetFailedAiStatus: vi.fn(),
};

const mockChatClient: IChatCompletionClient = {
  chat: mockChat,
};

const baseProduct: NormalizedProduct = {
  id: 'p1',
  providerId: 'prov1',
  name: 'Test Product',
  normalizedName: 'Test Product',
  normalizedCategory: 'Gifts',
  normalizedDescription: 'A test product for gifts',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EnhanceProductUseCase', () => {
  it('throws \"Product not found\" when findNormalized returns null', async () => {
    mockFindNormalized.mockResolvedValue(null);

    const useCase = new EnhanceProductUseCase(mockProductRepo, mockChatClient);

    await expect(
      useCase.execute({ providerId: 'prov1', productId: 'p1' }),
    ).rejects.toThrow('Product not found');

    expect(mockChat).not.toHaveBeenCalled();
  });

  it('returns product and events when AI returns simple comma-separated list', async () => {
    mockFindNormalized.mockResolvedValue(baseProduct);
    mockChat.mockResolvedValue('Trade show giveaway, Client appreciation, Launch event, Thank you, Employee award');

    const useCase = new EnhanceProductUseCase(mockProductRepo, mockChatClient);
    const result = await useCase.execute({ providerId: 'prov1', productId: 'p1' });

    expect(result.product).toMatchObject({ ...baseProduct, events: expect.any(String) });

    expect(result.events).toBe('Trade show giveaway, Client appreciation, Launch event, Thank you, Employee award');

    expect(mockChat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user', content: expect.stringContaining('Test Product') }),
      ]),
    );
  });

  it('normalizes numbered list response to comma-separated events', async () => {
    mockFindNormalized.mockResolvedValue(baseProduct);
    mockChat.mockResolvedValue('1. Trade show  2. Client gift  3. Launch  4. Thank you  5. Award');

    const useCase = new EnhanceProductUseCase(mockProductRepo, mockChatClient);
    const result = await useCase.execute({ providerId: 'prov1', productId: 'p1' });

    expect(result.events).toContain('Trade show');
    expect(result.events).toContain('Client gift');
    expect(result.events).not.toMatch(/^\d+[.)]\s*/);
  });

  it('strips title-like segment and keeps event names', async () => {
    mockFindNormalized.mockResolvedValue(baseProduct);
    mockChat.mockResolvedValue('Events where this works: 1. Trade show, 2. Client gift, 3. Launch');

    const useCase = new EnhanceProductUseCase(mockProductRepo, mockChatClient);
    const result = await useCase.execute({ providerId: 'prov1', productId: 'p1' });

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events).not.toContain('Events where this works');
  });

  it('builds summary from normalized fields (normalizedName, normalizedCategory, normalizedDescription)', async () => {
    mockFindNormalized.mockResolvedValue(baseProduct);
    mockChat.mockResolvedValue('A, B, C, D, E');

    const useCase = new EnhanceProductUseCase(mockProductRepo, mockChatClient);
    await useCase.execute({ providerId: 'prov1', productId: 'p1' });

    const userMessage = mockChat.mock.calls[0][0].find((m: { role: string }) => m.role === 'user');
    expect(userMessage.content).toContain('Product: Test Product');
    expect(userMessage.content).toContain('Category: Gifts');
    expect(userMessage.content).toContain('Description: A test product for gifts');
  });
});

