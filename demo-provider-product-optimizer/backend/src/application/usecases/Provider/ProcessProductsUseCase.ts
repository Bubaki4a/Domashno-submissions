import { IProvider } from '../../../domain/providers/IProvider';
import { IProductRepository } from '../../../infrastructure/providers/interfaces/IProductRepository';

export class ProcessProductsUseCase {
  constructor(private productRepository: IProductRepository) { }

  async execute(
    provider: IProvider,
    rawProducts: any[]
  ): Promise<{
    processedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processedCount = 0;

    const providerId = provider.getName().toLowerCase();

    for (const rawProduct of rawProducts) {
      try {
        // Transform raw product to ProductEntity
        const productEntity = provider.transformProduct(rawProduct);

        // Save product to repository
        await this.productRepository.save(providerId, productEntity);

        processedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        const productId = rawProduct?.id || rawProduct?.productId || 'unknown';
        const fullError = errorStack ? `${errorMessage}\n${errorStack}` : errorMessage;
        console.error(`Failed to process product ${productId}:`, fullError);
        errors.push(`Failed to process product ${productId}: ${errorMessage}`);
      }
    }

    return {
      processedCount,
      errors,
    };
  }
}
