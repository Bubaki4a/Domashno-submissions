import { ProviderSource } from '../../../domain/providers/ProviderSource';

export interface IProviderRepository {
  saveSource(providerId: string, provider: string, products: any[]): Promise<string>;
  readSource(providerId: string, filename: string): Promise<ProviderSource | null>;
  getAllSourceFiles(providerId?: string): Promise<string[]>;
}
