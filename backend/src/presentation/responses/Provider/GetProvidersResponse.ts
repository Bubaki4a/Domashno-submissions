import { Response } from '../Response';

export interface ProviderInfo {
  name: string;
  displayName: string;
  isConfigured: boolean;
  lastSync?: string;
  productsCount?: number;
}

export class GetProvidersResponse extends Response {
  providers: ProviderInfo[];

  constructor(
    providers: ProviderInfo[],
    success: boolean = true,
    message: string = 'Providers retrieved successfully'
  ) {
    super(success, { providers }, message);
    this.providers = providers;
  }
}
