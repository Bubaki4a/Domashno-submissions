import { promises as fs } from 'fs';
import path from 'path';
import { IProvider } from '../../../domain/providers/IProvider';
import { IProviderRepository } from '../../../infrastructure/providers/interfaces/IProviderRepository';
import { ProcessProductsUseCase } from './ProcessProductsUseCase';

export class SyncProviderUseCase {
  constructor(
    private provider: IProvider,
    private providerId: number, // Добавено: Числовото ID от базата
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
      const rawProducts = await this.provider.fetchProducts();
      productsCount = rawProducts.length;

      if (productsCount === 0) {
        return { success: true, provider: this.provider.getName(), sourceFilename: '', productsCount: 0, processedCount: 0, errors: ['No products found'] };
      }

      // Използваме името за папката (slug), но ID-то за базата
      const providerSlug = this.provider.getName().toLowerCase();

      // --- DEBUG MIRROR: Записваме source.json за проверка ---
      try {
        const debugPath = path.resolve(process.cwd(), `data/providers/${providerSlug}/sources`);
        await fs.mkdir(debugPath, { recursive: true });
        await fs.writeFile(path.join(debugPath, 'source.json'), JSON.stringify(rawProducts, null, 2));
      } catch (e) {
        console.warn('Failed to write debug source.json file');
      }

      // Save to primary repository (MySQL) - използваме числовото ID
      sourceFilename = await this.providerRepository.saveSource(
        this.providerId.toString(), 
        this.provider.getName(),
        rawProducts
      );

      // Стартираме процесирането с числовото ID
      const processResult = await this.processProductsUseCase.execute(
        this.provider, 
        this.providerId, 
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
      errors.push(`Sync failed: ${errorMessage}`);
      return { success: false, provider: this.provider.getName(), sourceFilename: '', productsCount: 0, processedCount: 0, errors };
    }
  }
}