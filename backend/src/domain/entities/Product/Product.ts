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
  providerData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
