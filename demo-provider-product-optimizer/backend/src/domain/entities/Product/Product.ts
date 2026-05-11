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
  providerData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
