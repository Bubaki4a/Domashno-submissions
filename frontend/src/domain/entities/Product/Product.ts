export interface Product {
  id: string;
  name: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  sku?: string;
  stock?: number;
  provider?: string;
  /** Provider key (e.g. easygifts) for API; set when listing/getting from API */
  providerId?: string;
  providerData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  /** Normalized fields from product_normalized (edit/save) */
  normalizedName?: string;
  normalizedDescription?: string;
  normalizedCategory?: string;
  /** AI-generated: events where this product can be used as merchant gift */
  events?: string;
}
