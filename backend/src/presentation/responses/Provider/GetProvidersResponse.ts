import { Response } from '../Response';

export interface ProviderInfo {
  id: number;
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
    // Тук изпращаме обекта към базовия клас Response
    super(success, { providers }, message);
    this.providers = providers;
  }
}