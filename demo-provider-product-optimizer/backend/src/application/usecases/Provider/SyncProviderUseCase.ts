import { IProvider } from '../../../domain/providers/IProvider';
import { IProviderRepository } from '../../../infrastructure/providers/interfaces/IProviderRepository';
import { ProcessProductsUseCase } from './ProcessProductsUseCase';

export class SyncProviderUseCase {
  constructor(
    private provider: IProvider,
    private providerRepository: IProviderRepository,
    private processProductsUseCase: ProcessProductsUseCase
  ) { }

  async execute(): Promise<{
    success: boolean;
    provider: string;
    sourceFilename: string;
    productsCount: number;
    processedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let productsCount = 0;
    let processedCount = 0;
    let sourceFilename = '';

    try {
      // Fetch products from provider
      const rawProducts = await this.provider.fetchProducts();
      productsCount = rawProducts.length;

      if (productsCount === 0) {
        return {
          success: true,
          provider: this.provider.getName(),
          sourceFilename: '',
          productsCount: 0,
          processedCount: 0,
          errors: ['No products found from provider'],
        };
      }

      // Save source file with timestamp
      const providerId = this.provider.getName().toLowerCase();
      sourceFilename = await this.providerRepository.saveSource(
        providerId,
        this.provider.getName(),
        rawProducts
      );

      // Process and save products
      const processResult = await this.processProductsUseCase.execute(
        this.provider,
        rawProducts
      );

      processedCount = processResult.processedCount;
      errors.push(...processResult.errors);

      return {
        success: errors.length === 0,
        provider: this.provider.getName(),
        sourceFilename,
        productsCount,
        processedCount,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error(`Sync failed for provider ${this.provider.getName()}:`, errorMessage, errorStack);
      errors.push(`Sync failed: ${errorMessage}`);

      return {
        success: false,
        provider: this.provider.getName(),
        sourceFilename,
        productsCount,
        processedCount,
        errors,
      };
    }
  }
}
