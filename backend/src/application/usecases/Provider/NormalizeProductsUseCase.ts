import { IProductRepository } from "../../../infrastructure/providers/interfaces/IProductRepository";
import { IProviderRepository } from "../../../infrastructure/providers/interfaces/IProviderRepository";
import { NormalizedProduct } from "../../../domain/entities/NormalizedProduct/NormalizedProduct";
import { NormalizedProductEntity } from "../../../domain/entities/NormalizedProduct/NormalizedProductEntity";

export class NormalizeProductsUseCase {
  constructor(
    private productRepository: IProductRepository,
    private providerRepository: IProviderRepository
  ) { }

  async execute(providerSlug: string): Promise<{
    processedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processedCount = 0;

    try {
      if (!providerSlug) throw new Error('Provider is required');

      const providerRecord = await this.providerRepository.findProviderBySlug(providerSlug.toLowerCase());
      if (!providerRecord) {
        throw new Error(`Provider ${providerSlug} not found in database`);
      }

      const providerId = providerRecord.id.toString();

      const products = await this.productRepository.findAll(providerId);

      if (products.length === 0) {
        return { processedCount: 0, errors: [`No products found for provider ID: ${providerId}`] };
      }

      for (const product of products) {
        try {
          const normalizedEntity = this.normalizeProduct(product);
          await this.productRepository.saveNormalized(providerId, product.id, normalizedEntity.toJSON());
          processedCount++;
        } catch (error) {
          errors.push(`Failed to normalize product ${product.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { processedCount, errors };
    } catch (error) {
      errors.push(`Normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { processedCount: 0, errors };
    }
  }

  private normalizeProduct(product: any): NormalizedProductEntity {
    // Подготвяме данните, като гарантираме, че id и name са стрингове
    const id = (product.id || '').toString();
    const name = (product.name || 'Unnamed Product').toString();

    const normalizedData: NormalizedProduct = {
      id: id,
      name: name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      sku: product.sku,
      stock: product.stock,
      provider: product.provider,
      normalizedName: this.normalizeName(product.name),
      normalizedDescription: this.normalizeDescription(product.description),
      normalizedCategory: this.normalizeCategory(product.category),
      metadata: {
        tags: this.extractTags(product),
        keywords: this.extractKeywords(product),
        seoTitle: this.generateSeoTitle(product),
        seoDescription: this.generateSeoDescription(product),
        optimizedImageUrl: product.imageUrl,
        qualityScore: this.calculateQualityScore(product),
        lastNormalized: new Date().toISOString(),
      },
    };

    // Използваме "as any" или изрично подаваме задължителните полета, за да удовлетворим TS
    return NormalizedProductEntity.create(normalizedData as any);
  }

  private normalizeName(name: string | undefined): string | undefined {
    if (!name) return undefined;
    return name.trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  private normalizeDescription(description: string | undefined): string | undefined {
    if (!description) return undefined;
    return description.trim().replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n');
  }

  private normalizeCategory(category: string | undefined): string | undefined {
    return category ? category.trim().toLowerCase() : undefined;
  }

  private extractTags(product: any): string[] {
    const tags: string[] = [];
    if (product.category) tags.push(product.category.toLowerCase());
    if (product.name) {
      const words = product.name.toLowerCase().split(/\s+/);
      tags.push(...words.filter((w: string) => w.length > 3));
    }
    return [...new Set(tags)];
  }

  private extractKeywords(product: any): string[] {
    const keywords: string[] = [];
    if (product.name) keywords.push(...product.name.toLowerCase().split(/\s+/));
    if (product.category) keywords.push(product.category.toLowerCase());
    return [...new Set(keywords)];
  }

  private generateSeoTitle(product: any): string {
    const parts: string[] = [];
    if (product.name) parts.push(product.name);
    if (product.category) parts.push(product.category);
    return parts.join(' - ').substring(0, 60);
  }

  private generateSeoDescription(product: any): string {
    if (product.description) return product.description.substring(0, 160);
    return product.name ? `Buy ${product.name} online.` : '';
  }

  private calculateQualityScore(product: any): number {
    let score = 0;
    if (product.name) score += 20;
    if (product.description) score += 20;
    if (product.price !== undefined) score += 20;
    if (product.imageUrl) score += 20;
    if (product.category) score += 20;
    return Math.min(score, 100);
  }
}