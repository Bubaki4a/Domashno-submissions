import { IProvider } from '../../domain/providers/IProvider';
import { ProductEntity } from '../../domain/entities/Product/ProductEntity';
import { IHttpClient } from '../http/httpClient';

export class EasyGiftsProvider implements IProvider {
  private httpClient: IHttpClient;
  private apiUrl: string;

  constructor(httpClient: IHttpClient, apiUrl?: string) {
    this.httpClient = httpClient;
    this.apiUrl = apiUrl || process.env.EASYGIFTS_API_URL || '';

    if (!this.apiUrl) {
      throw new Error('EasyGifts API URL is required. Set EASYGIFTS_API_URL environment variable.');
    }
  }

  getName(): string {
    return 'EasyGifts';
  }

  async fetchProducts(): Promise<any[]> {
    try {
      console.log(`Fetching products from EasyGifts API: ${this.apiUrl}`);
      const response = await this.httpClient.get<any>(this.apiUrl);

      // Handle different response structures
      if (Array.isArray(response)) {
        console.log(`Successfully fetched ${response.length} products from EasyGifts`);
        return response;
      }

      if (response && typeof response === 'object') {
        // Try common property names
        if (Array.isArray(response.products)) {
          console.log(`Successfully fetched ${response.products.length} products from EasyGifts`);
          return response.products;
        }
        if (Array.isArray(response.data)) {
          console.log(`Successfully fetched ${response.data.length} products from EasyGifts`);
          return response.data;
        }
        if (Array.isArray(response.items)) {
          console.log(`Successfully fetched ${response.items.length} products from EasyGifts`);
          return response.items;
        }
      }

      throw new Error('Invalid response format from EasyGifts API - expected array or object with products/data/items array');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to fetch products from EasyGifts API (${this.apiUrl}):`, errorMessage);
      throw new Error(
        `Failed to fetch products from EasyGifts: ${errorMessage}`
      );
    }
  }

  transformProduct(raw: any): ProductEntity {
    // Extract and normalize product data
    const id = this.extractId(raw);
    const name = this.extractName(raw);
    const price = this.extractPrice(raw);
    const description = this.extractDescription(raw);
    const imageUrl = this.extractImageUrl(raw);
    const category = this.extractCategory(raw);
    const sku = this.extractSku(raw);
    const stock = this.extractStock(raw);

    return ProductEntity.create({
      id,
      name,
      price,
      description,
      imageUrl,
      category,
      sku,
      stock,
      provider: this.getName(),
      providerData: raw, // Store original data for reference
      createdAt: this.extractCreatedAt(raw),
      updatedAt: new Date().toISOString(),
    });
  }

  private extractId(raw: any): string {
    return (
      raw.id?.toString() ||
      raw.productId?.toString() ||
      raw.product_id?.toString() ||
      raw.sku?.toString() ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  private extractName(raw: any): string {
    return (
      raw.name?.toString() ||
      raw.title?.toString() ||
      raw.productName?.toString() ||
      raw.product_name?.toString() ||
      'Unnamed Product'
    );
  }

  private extractPrice(raw: any): number | undefined {
    const price =
      raw.price ||
      raw.priceValue ||
      raw.price_value ||
      raw.cost ||
      raw.amount;

    if (price === undefined || price === null) {
      return undefined;
    }

    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    return isNaN(numPrice) ? undefined : numPrice;
  }

  private extractDescription(raw: any): string | undefined {
    return (
      raw.description?.toString() ||
      raw.desc?.toString() ||
      raw.details?.toString() ||
      raw.productDescription?.toString() ||
      raw.product_description?.toString()
    );
  }

  private extractImageUrl(raw: any): string | undefined {
    return (
      raw.imageUrl?.toString() ||
      raw.image_url?.toString() ||
      raw.image?.toString() ||
      raw.imageUrl?.toString() ||
      raw.photo?.toString() ||
      raw.picture?.toString()
    );
  }

  private extractCategory(raw: any): string | undefined {
    return (
      raw.category?.toString() ||
      raw.categoryName?.toString() ||
      raw.category_name?.toString() ||
      raw.type?.toString()
    );
  }

  private extractSku(raw: any): string | undefined {
    return (
      raw.sku?.toString() ||
      raw.productSku?.toString() ||
      raw.product_sku?.toString() ||
      raw.code?.toString()
    );
  }

  private extractStock(raw: any): number | undefined {
    const stock =
      raw.stock ||
      raw.quantity ||
      raw.inventory ||
      raw.stockQuantity ||
      raw.stock_quantity ||
      raw.availableQuantity ||
      raw.available_quantity;

    if (stock === undefined || stock === null) {
      return undefined;
    }

    const numStock = typeof stock === 'string' ? parseInt(stock, 10) : Number(stock);
    return isNaN(numStock) ? undefined : numStock;
  }

  private extractCreatedAt(raw: any): string {
    if (raw.createdAt) {
      return new Date(raw.createdAt).toISOString();
    }
    if (raw.created_at) {
      return new Date(raw.created_at).toISOString();
    }
    if (raw.dateCreated) {
      return new Date(raw.dateCreated).toISOString();
    }
    if (raw.date_created) {
      return new Date(raw.date_created).toISOString();
    }
    return new Date().toISOString();
  }
}
