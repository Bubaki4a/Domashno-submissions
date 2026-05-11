import { Response } from '../Response';

export class SyncProviderResponse extends Response {
  provider: string;
  sourceFilename: string;
  productsCount: number;
  processedCount: number;
  errors: string[];

  constructor(
    data: {
      provider: string;
      sourceFilename: string;
      productsCount: number;
      processedCount: number;
      errors: string[];
    },
    success: boolean = true,
    message: string = 'Provider synchronized successfully'
  ) {
    super(success, data, message);
    this.provider = data.provider;
    this.sourceFilename = data.sourceFilename;
    this.productsCount = data.productsCount;
    this.processedCount = data.processedCount;
    this.errors = data.errors;
  }
}
