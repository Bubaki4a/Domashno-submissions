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

    // Взимаме доставчиците от БД (id, slug, display_name, api_url, last_sync, is_configured)
    const dbProviders = await this.providerRepository.findAllProviders();

    for (const provider of dbProviders) {
      // Важно: използваме числовото id (1, 2...) за броене
      const productsCount = await this.getProductsCount(provider.id);

      providers.push({
        id: provider.id,
        name: provider.slug, // 'midocean'
        displayName: provider.displayName,
        // Вече гледаме базата, а не .env файла
        isConfigured: Boolean(provider.isConfigured), 
        lastSync: provider.lastSync ? new Date(provider.lastSync).toISOString() : undefined,
        productsCount: productsCount,
      });
    }

    return providers;
  }

  private async getProductsCount(providerId: number): Promise<number | undefined> {
    try {
      // Търсим в таблица products/normalized по числовото ID
      const products = await this.productRepository.findAll(providerId.toString());
      return products.length;
    } catch (error) {
      console.error(`Failed to get products count for provider ${providerId}:`, error);
      return 0;
    }
  }
}