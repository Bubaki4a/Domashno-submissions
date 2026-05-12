import { IProvider } from '../../domain/providers/IProvider';
import { ProductEntity } from '../../domain/entities/Product/ProductEntity';
import { IHttpClient } from '../http/httpClient';

export class MidoceanProvider implements IProvider {
  private httpClient: IHttpClient;
  private apiUrl: string;
  private apiKey: string;

  constructor(httpClient: IHttpClient, apiUrl?: string, apiKey?: string) {
    this.httpClient = httpClient;
    this.apiUrl = apiUrl || process.env.MIDOCEAN_API_URL || '';
    this.apiKey = apiKey || process.env.MIDOCEAN_API_KEY || '';

    if (!this.apiUrl) {
      throw new Error('Midocean API URL is required. Set MIDOCEAN_API_URL environment variable.');
    }
    if (!this.apiKey) {
      throw new Error('Midocean API key is required. Set MIDOCEAN_API_KEY environment variable.');
    }
  }

  getName(): string {
    return 'Midocean';
  }

  async fetchProducts(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any>(this.apiUrl, {
        headers: {
          'x-Gateway-APIKey': this.apiKey,
        },
      });

      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.products)) {
        return response.products;
      }
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      if (response && Array.isArray(response.results)) {
        return response.results;
      }
      if (response && response.response && Array.isArray(response.response.products)) {
        return response.response.products;
      }

      throw new Error('Unexpected Midocean response format. Expected JSON array or object with products/data/results');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to fetch Midocean products: ${errorMessage}`);
      throw new Error(`Failed to fetch Midocean products: ${errorMessage}`);
    }
  }

  transformProduct(raw: any): ProductEntity {
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
      providerData: raw,
      createdAt: this.extractCreatedAt(raw),
      updatedAt: new Date().toISOString(),
    });
  }

  private extractId(raw: any): string {
    return (
      raw.id?.toString() ||
      raw.productId?.toString() ||
      raw.product_id?.toString() ||
      raw.productCode?.toString() ||
      raw.product_code?.toString() ||
      raw.code?.toString() ||
      raw.sku?.toString() ||
      raw.gatewayProductId?.toString() ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  private extractName(raw: any): string {
    return (
      raw.name?.toString() ||
      raw.title?.toString() ||
      raw.productName?.toString() ||
      raw.product_name?.toString() ||
      raw.variantName?.toString() ||
      'Unnamed Product'
    );
  }

  private extractPrice(raw: any): number | undefined {
    const priceValue =
      raw.price ||
      raw.priceValue ||
      raw.price_value ||
      raw.amount ||
      raw.priceAmount ||
      raw.price_amount ||
      raw.cost ||
      raw.unitPrice ||
      raw.unit_price ||
      raw.price?.amount ||
      raw.price?.value ||
      raw.amount?.value;

    if (priceValue === undefined || priceValue === null) {
      return undefined;
    }

    const numPrice = typeof priceValue === 'string' ? parseFloat(priceValue) : Number(priceValue);
    return Number.isFinite(numPrice) ? numPrice : undefined;
  }

  private extractDescription(raw: any): string | undefined {
    return (
      raw.description?.toString() ||
      raw.desc?.toString() ||
      raw.details?.toString() ||
      raw.longDescription?.toString() ||
      raw.long_description?.toString() ||
      raw.productDescription?.toString() ||
      raw.product_description?.toString()
    );
  }

  private extractImageUrl(raw: any): string | undefined {
    const candidate =
      raw.imageUrl ||
      raw.image_url ||
      raw.image ||
      raw.photo ||
      raw.picture ||
      raw.mediaUrl ||
      raw.media_url ||
      raw.mainImage ||
      raw.main_image;

    if (typeof candidate === 'string') {
      return candidate;
    }

    if (Array.isArray(candidate) && candidate.length > 0) {
      const first = candidate[0];
      return typeof first === 'string' ? first : first?.url?.toString();
    }

    if (raw.images && Array.isArray(raw.images) && raw.images.length > 0) {
      return raw.images[0]?.url?.toString() || raw.images[0]?.src?.toString();
    }

    if (raw.media && Array.isArray(raw.media) && raw.media.length > 0) {
      return raw.media[0]?.url?.toString() || raw.media[0]?.src?.toString();
    }

    return undefined;
  }

  private extractCategory(raw: any): string | undefined {
    return (
      raw.category?.toString() ||
      raw.categoryName?.toString() ||
      raw.category_name?.toString() ||
      raw.type?.toString() ||
      raw.productType?.toString() ||
      raw.product_type?.toString()
    );
  }

  private extractSku(raw: any): string | undefined {
    return (
      raw.sku?.toString() ||
      raw.productSku?.toString() ||
      raw.product_sku?.toString() ||
      raw.code?.toString() ||
      raw.productCode?.toString() ||
      raw.product_code?.toString()
    );
  }

  private extractStock(raw: any): number | undefined {
    const stockValue =
      raw.stock ||
      raw.quantity ||
      raw.inventory ||
      raw.stockQuantity ||
      raw.stock_quantity ||
      raw.availableQuantity ||
      raw.available_quantity ||
      raw.available ||
      raw.inStock;

    if (stockValue === undefined || stockValue === null) {
      return undefined;
    }

    const numStock = typeof stockValue === 'string' ? parseInt(stockValue, 10) : Number(stockValue);
    return Number.isFinite(numStock) ? numStock : undefined;
  }

  private extractCreatedAt(raw: any): string {
    const createdAtValue =
      raw.createdAt ||
      raw.created_at ||
      raw.dateCreated ||
      raw.date_created ||
      raw.createdDate ||
      raw.timestamp ||
      raw.timeStamp;

    if (createdAtValue) {
      return new Date(createdAtValue).toISOString();
    }

    return new Date().toISOString();
  }
}
