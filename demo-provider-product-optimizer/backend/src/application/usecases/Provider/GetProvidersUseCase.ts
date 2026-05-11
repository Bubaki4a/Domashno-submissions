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

    // EasyGifts provider
    const easyGiftsInfo = await this.getProviderInfo('EasyGifts', 'easygifts');
    providers.push(easyGiftsInfo);

    // Future providers can be added here
    // const anotherProviderInfo = await this.getProviderInfo('AnotherProvider', 'another');
    // providers.push(anotherProviderInfo);

    return providers;
  }

  private async getProviderInfo(name: string, key: string): Promise<ProviderInfo> {
    const isConfigured = this.isProviderConfigured(key);

    // Get last sync timestamp
    const lastSync = await this.getLastSyncTimestamp(key);

    // Get products count for this provider
    const productsCount = await this.getProductsCount(key);

    return {
      name: key,
      displayName: name,
      isConfigured,
      lastSync,
      productsCount,
    };
  }

  private isProviderConfigured(key: string): boolean {
    // Check if provider is configured via environment variables
    switch (key) {
      case 'easygifts':
        return !!process.env.EASYGIFTS_API_URL;
      default:
        return false;
    }
  }

  private async getLastSyncTimestamp(key: string): Promise<string | undefined> {
    try {
      const providerId = key.toLowerCase();
      const sourceFiles = await this.providerRepository.getAllSourceFiles(providerId);

      // Find the most recent source file for this provider
      const providerFiles = sourceFiles
        .filter(file => file.startsWith('products-'))
        .map(file => ({
          filename: file,
          timestamp: this.extractTimestampFromFilename(file),
        }))
        .filter(f => f.timestamp)
        .sort((a, b) => {
          const dateA = new Date(a.timestamp!);
          const dateB = new Date(b.timestamp!);
          return dateB.getTime() - dateA.getTime();
        });

      if (providerFiles.length > 0) {
        // Read the most recent file to check provider
        const source = await this.providerRepository.readSource(providerId, providerFiles[0].filename);
        if (source && source.provider.toLowerCase() === key.toLowerCase()) {
          return source.timestamp;
        }
      }
    } catch (error) {
      console.error(`Failed to get last sync for ${key}:`, error);
    }

    return undefined;
  }

  private extractTimestampFromFilename(filename: string): string | null {
    // Extract timestamp from filename like "products-2024-01-15_10-30-00.json"
    const match = filename.match(/products-(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.json/);
    if (match) {
      const dateStr = match[1].replace(/_/g, ' ').replace(/-/g, ':');
      // Convert to ISO format
      const [datePart, timePart] = dateStr.split(' ');
      const [year, month, day] = datePart.split(':');
      const [hour, minute, second] = timePart.split(':');
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      ).toISOString();
    }
    return null;
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
