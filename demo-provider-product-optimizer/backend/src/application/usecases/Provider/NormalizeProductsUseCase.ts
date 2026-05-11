import { IProductRepository } from "../../../infrastructure/providers/interfaces/IProductRepository";
import { NormalizedProduct } from "../../../domain/entities/NormalizedProduct/NormalizedProduct";
import { NormalizedProductEntity } from "../../../domain/entities/NormalizedProduct/NormalizedProductEntity";

export class NormalizeProductsUseCase {
  constructor(private productRepository: IProductRepository) { }

  async execute(provider: string): Promise<{
    processedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processedCount = 0;

    try {
      // Validate provider parameter
      if (!provider || provider.trim().length === 0) {
        throw new Error('Provider is required');
      }

      // Get products directly from the specified provider using providerId
      const providerId = provider.toLowerCase();
      const products = await this.productRepository.findAll(providerId);

      if (products.length === 0) {
        return {
          processedCount: 0,
          errors: [`No products found for provider: ${provider}`],
        };
      }

      // Process all products from this provider
      for (const product of products) {
        try {
          // Normalize the product
          const normalizedEntity = this.normalizeProduct(product);

          // Save normalized version (convert entity to JSON)
          await this.productRepository.saveNormalized(providerId, product.id, normalizedEntity.toJSON());

          processedCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;
          console.error(`Failed to normalize product ${product.id} for provider ${providerId}:`, errorMessage, errorStack);
          errors.push(`Failed to normalize product ${product.id}: ${errorMessage}`);
        }
      }

      return {
        processedCount,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error(`Normalization failed for provider ${provider}:`, errorMessage, errorStack);
      errors.push(`Normalization failed: ${errorMessage}`);
      return {
        processedCount,
        errors,
      };
    }
  }

  private normalizeProduct(product: any): NormalizedProductEntity {
    // Create normalized product with enriched data
    const normalizedData: NormalizedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      sku: product.sku,
      stock: product.stock,
      provider: product.provider,
      // Normalized fields
      normalizedName: this.normalizeName(product.name),
      normalizedDescription: this.normalizeDescription(product.description),
      normalizedCategory: this.normalizeCategory(product.category),
      // Metadata
      metadata: {
        tags: this.extractTags(product),
        keywords: this.extractKeywords(product),
        seoTitle: this.generateSeoTitle(product),
        seoDescription: this.generateSeoDescription(product),
        optimizedImageUrl: this.optimizeImageUrl(product.imageUrl),
        qualityScore: this.calculateQualityScore(product),
        lastNormalized: new Date().toISOString(),
      },
    };

    // Create entity with validation
    return NormalizedProductEntity.create(normalizedData);
  }

  private normalizeName(name: string | undefined): string | undefined {
    if (!name) return undefined;
    // Remove extra spaces, trim, capitalize first letter
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private normalizeDescription(description: string | undefined): string | undefined {
    if (!description) return undefined;
    // Clean up description, remove extra whitespace
    return description
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }

  private normalizeCategory(category: string | undefined): string | undefined {
    if (!category) return undefined;
    // Normalize category name
    return category.trim().toLowerCase();
  }

  private extractTags(product: any): string[] {
    const tags: string[] = [];

    if (product.category) {
      tags.push(product.category.toLowerCase());
    }

    if (product.name) {
      // Extract key words from name
      const words = product.name.toLowerCase().split(/\s+/);
      tags.push(...words.filter((w: string) => w.length > 3));
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private extractKeywords(product: any): string[] {
    const keywords: string[] = [];

    if (product.name) keywords.push(...product.name.toLowerCase().split(/\s+/));
    if (product.category) keywords.push(product.category.toLowerCase());
    if (product.sku) keywords.push(product.sku.toLowerCase());

    return [...new Set(keywords)];
  }

  private generateSeoTitle(product: any): string {
    const parts: string[] = [];
    if (product.name) parts.push(product.name);
    if (product.category) parts.push(product.category);
    return parts.join(' - ').substring(0, 60); // Limit to 60 chars
  }

  private generateSeoDescription(product: any): string {
    if (product.description) {
      return product.description.substring(0, 160); // Limit to 160 chars
    }
    if (product.name) {
      return `Buy ${product.name} online. ${product.category || 'Product'} available now.`;
    }
    return '';
  }

  private optimizeImageUrl(imageUrl: string | undefined): string | undefined {
    if (!imageUrl) return undefined;
    // In a real implementation, this would resize/optimize the image
    // For now, just return the original URL
    return imageUrl;
  }

  private calculateQualityScore(product: any): number {
    let score = 0;

    if (product.name) score += 20;
    if (product.description) score += 20;
    if (product.price !== undefined) score += 15;
    if (product.imageUrl) score += 15;
    if (product.category) score += 10;
    if (product.sku) score += 10;
    if (product.stock !== undefined) score += 10;

    return Math.min(score, 100);
  }
}
