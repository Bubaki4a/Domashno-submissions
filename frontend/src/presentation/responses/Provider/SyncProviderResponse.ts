import type { Response } from '../Response';

export interface SyncProviderResponse extends Response<{
  provider: string;
  sourceFilename: string;
  productsCount: number;
  processedCount: number;
  errors: string[];
}> {
  provider: string;
  sourceFilename: string;
  productsCount: number;
  processedCount: number;
  errors: string[];
}
