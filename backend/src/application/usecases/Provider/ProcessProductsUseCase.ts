import { IProvider } from '../../../domain/providers/IProvider';
import { IProductRepository } from '../../../infrastructure/providers/interfaces/IProductRepository';

export class ProcessProductsUseCase {
  constructor(private productRepository: IProductRepository) { }

  async execute(
    provider: IProvider,
    providerId: number, // Променено на number
    rawProducts: any[]
  ): Promise<{
    processedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processedCount = 0;

    for (const rawProduct of rawProducts) {
      try {
        const productEntity = provider.transformProduct(rawProduct);

        // Записваме в базата, като предаваме числото (MySQL ще го приеме в INT колоната)
        await this.productRepository.save(providerId.toString(), productEntity);

        processedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const productId = rawProduct?.master_code || rawProduct?.id || 'unknown';
        errors.push(`Failed to process product ${productId}: ${errorMessage}`);
      }
    }

    return {
      processedCount,
      errors,
    };
  }
}