import type { IProductRepository } from '../../../infrastructure/providers/interfaces/IProductRepository';

export interface RetryFailedProductsInput {
  providerId?: string;
}

export class RetryFailedProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: RetryFailedProductsInput = {}): Promise<number> {
    return this.productRepository.resetFailedAiStatus(input.providerId);
  }
}
