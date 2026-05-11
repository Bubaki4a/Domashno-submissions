export interface NormalizedProductMetadata {
  tags?: string[];
  keywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
  optimizedImageUrl?: string;
  qualityScore?: number;
  lastNormalized?: string;
}

export interface NormalizedProduct {
  id: string;
  name: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  sku?: string;
  stock?: number;
  provider?: string;
  // Normalized/Enriched fields
  normalizedName?: string;
  normalizedDescription?: string;
  normalizedCategory?: string;
  metadata?: NormalizedProductMetadata;

}
