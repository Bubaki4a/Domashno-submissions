import type { IProductRepository, ProductAiStatusRow } from '../../../infrastructure/providers/interfaces/IProductRepository';

export interface ListFailedProductsInput {
  providerId?: string;
  limit?: number;
}

export class ListFailedProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: ListFailedProductsInput = {}): Promise<ProductAiStatusRow[]> {
    const limit = input.limit ?? 500;
    return this.productRepository.findByAiStatus('failed', input.providerId, limit);
  }
}
