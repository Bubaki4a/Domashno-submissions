import { Response } from '../Response';

export class NormalizeProductsResponse extends Response {
  processedCount: number;
  errors: string[];
  provider?: string;

  constructor(
    data: {
      processedCount: number;
      errors: string[];
      provider?: string;
    },
    success: boolean = true,
    message: string = 'Products normalized successfully'
  ) {
    super(success, data, message);
    this.processedCount = data.processedCount;
    this.errors = data.errors;
    this.provider = data.provider;
  }
}
