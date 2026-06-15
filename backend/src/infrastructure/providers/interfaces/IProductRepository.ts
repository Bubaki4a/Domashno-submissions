import { Product } from '../../../domain/entities/Product/Product';
import { NormalizedProduct } from '../../../domain/entities/NormalizedProduct/NormalizedProduct';
import { ProductEntity } from '../../../domain/entities/Product/ProductEntity';

export type AiStatus = 'pending' | 'completed' | 'failed';

export interface ProductAiStatusRow {
  id: string;
  providerId: string;
}

export type ProductQualityStatus = 'ok' | 'issues' | 'error';

export interface ProductQualityCheckRow {
  id: string;
  providerId: string;
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  sku?: string;
  stock?: number;
  provider?: string;
  aiStatus?: AiStatus | null;
  aiError?: string | null;
  normalizedName?: string;
  normalizedDescription?: string;
  normalizedCategory?: string;
  events?: string;
  audience?: string;
  emotion?: string;
  qualityStatus?: ProductQualityStatus | null;
  qualityIssues?: unknown;
}

export interface ProductQualityIssueRow extends ProductQualityCheckRow {
  qualityStatus: ProductQualityStatus;
  qualityIssues: unknown;
}

export interface IProductRepository {
  save(providerId: string, product: ProductEntity): Promise<void>;
  findById(providerId: string, id: string): Promise<Product | null>;
  findAll(providerId?: string): Promise<Product[]>;
  delete(providerId: string, id: string): Promise<void>;
  saveNormalized(providerId: string, id: string, normalizedData: any): Promise<void>;
  findNormalized(providerId: string, id: string): Promise<NormalizedProduct | null>;
  findAllNormalized(providerId?: string): Promise<NormalizedProduct[]>;
  findAllWithNormalized(providerId?: string): Promise<{ product: Product; hasNormalized: boolean }[]>;
  deleteNormalized(providerId: string, productId: string): Promise<void>;
  findByAiStatus(
    status: AiStatus,
    providerId?: string,
    limit?: number,
  ): Promise<ProductAiStatusRow[]>;
  updateAiStatus(
    providerId: string,
    productId: string,
    status: AiStatus,
    aiError?: string | null,
  ): Promise<void>;
  markProductQuality(
    providerId: string,
    productId: string,
    qualityStatus: ProductQualityStatus,
    qualityIssues: unknown,
  ): Promise<void>;
  /** Set ai_status for all products of a provider (e.g. after import). Returns affected row count. */
  setAiStatusByProvider(providerId: string, status: AiStatus): Promise<number>;
  /** Set ai_status = 'pending' for products currently 'failed'. Optional providerId filter. Returns affected count. */
  resetFailedAiStatus(providerId?: string): Promise<number>;
  findProductsForQualityCheck(providerId?: string, limit?: number): Promise<ProductQualityCheckRow[]>;
  findProductsWithQualityIssues(providerId?: string, limit?: number): Promise<ProductQualityIssueRow[]>;
}