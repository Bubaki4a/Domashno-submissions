import { IProductRepository } from '../../../infrastructure/providers/interfaces/IProductRepository';

export class DeleteNormalizedProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(providerId: string, productId: string): Promise<void> {
    const existing = await this.productRepository.findNormalized(providerId, productId);
    if (!existing) {
      throw new Error('Normalized product not found');
    }
    await this.productRepository.deleteNormalized(providerId, productId);
  }
}