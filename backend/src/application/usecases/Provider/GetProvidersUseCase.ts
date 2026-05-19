import { IProviderRepository } from '../../../infrastructure/providers/interfaces/IProviderRepository';
import { IProductRepository } from '../../../infrastructure/providers/interfaces/IProductRepository';
import { ProviderInfo } from '../../../presentation/responses/Provider/GetProvidersResponse';

export class GetProvidersUseCase {
  constructor(
    private providerRepository: IProviderRepository,
    private productRepository: IProductRepository
  ) { }

  async execute(): Promise<ProviderInfo[]> {
    const providers: ProviderInfo[] = [];

    // Задача 1: Взимане на доставчиците от базата данни
    const dbProviders = await this.providerRepository.findAllProviders();

    for (const provider of dbProviders) {
      // Използваме съществуващата логика за броя продукти
      const productsCount = await this.getProductsCount(provider.id);

      providers.push({
        id: provider.id,
        name: provider.slug,
        displayName: provider.displayName,
        isConfigured: !!provider.api_url,
        lastSync: provider.lastSync ? new Date(provider.lastSync).toISOString() : undefined,
        productsCount,
      });
    }

    return providers;
  }

  private async getProductsCount(key: string): Promise<number | undefined> {
    try {
      const providerId = key.toLowerCase();
      const products = await this.productRepository.findAll(providerId);
      return products.length > 0 ? products.length : undefined;
    } catch (error) {
      console.error(`Failed to get products count for ${key}:`, error);
      return undefined;
    }
  }
}