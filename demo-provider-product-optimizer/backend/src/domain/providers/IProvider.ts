import { ProductEntity } from '../entities/Product/ProductEntity';

export interface IProvider {
  /**
   * Returns the name of the provider
   */
  getName(): string;

  /**
   * Fetches products from the provider's source (API, file, etc.)
   * @returns Promise resolving to an array of raw product data
   */
  fetchProducts(): Promise<any[]>;

  /**
   * Transforms raw product data from the provider into a standardized ProductEntity
   * @param raw Raw product data from the provider
   * @returns ProductEntity instance
   */
  transformProduct(raw: any): ProductEntity;
}
