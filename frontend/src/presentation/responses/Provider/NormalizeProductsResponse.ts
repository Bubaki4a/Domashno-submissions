import type { Response } from '../Response';

export interface NormalizeProductsResponse extends Response<{
  processedCount: number;
  errors: string[];
  provider?: string;
}> {
  processedCount: number;
  errors: string[];
  provider?: string;
}
