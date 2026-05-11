import type { Response } from '../Response';

export interface ProviderInfo {
  name: string;
  displayName: string;
  isConfigured: boolean;
  lastSync?: string;
  productsCount?: number;
}

export interface GetProvidersResponse extends Response<{ providers: ProviderInfo[] }> {
  providers: ProviderInfo[];
}
