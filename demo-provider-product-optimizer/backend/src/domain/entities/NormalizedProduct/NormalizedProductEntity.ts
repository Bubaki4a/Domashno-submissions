import { NormalizedProduct, NormalizedProductMetadata } from './NormalizedProduct';

export class NormalizedProductEntity {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly category: string | undefined,
    public readonly sku: string | undefined,
    public readonly stock: number | undefined,
    public readonly provider: string | undefined,
    public readonly normalizedName: string | undefined,
    public readonly normalizedDescription: string | undefined,
    public readonly normalizedCategory: string | undefined,
    public readonly metadata: NormalizedProductMetadata | undefined,
  ) { }

  static create(data: Partial<NormalizedProduct> & { id: string; name: string }): NormalizedProductEntity {
    // Validation
    if (!data.id || data.id.trim().length === 0) {
      throw new Error('NormalizedProduct ID is required');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('NormalizedProduct name is required');
    }

    // Validate price if provided
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
      throw new Error('NormalizedProduct price must be a non-negative number');
    }

    // Validate stock if provided
    if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0)) {
      throw new Error('NormalizedProduct stock must be a non-negative number');
    }

    // Validate qualityScore if provided in metadata
    if (data.metadata?.qualityScore !== undefined) {
      const qualityScore = data.metadata.qualityScore;
      if (typeof qualityScore !== 'number' || qualityScore < 0 || qualityScore > 100) {
        throw new Error('Quality score must be a number between 0 and 100');
      }
    }

    return new NormalizedProductEntity(
      data.id.trim(),
      data.name.trim(),
      data.price,
      data.description?.trim(),
      data.imageUrl?.trim(),
      data.category?.trim(),
      data.sku?.trim(),
      data.stock,
      data.provider?.trim(),
      data.normalizedName?.trim(),
      data.normalizedDescription?.trim(),
      data.normalizedCategory?.trim(),
      data.metadata,
    );
  }

  static fromData(data: NormalizedProduct): NormalizedProductEntity {
    return new NormalizedProductEntity(
      data.id,
      data.name,
      data.price,
      data.description,
      data.imageUrl,
      data.category,
      data.sku,
      data.stock,
      data.provider,
      data.normalizedName,
      data.normalizedDescription,
      data.normalizedCategory,
      data.metadata,
    );
  }

  toJSON(): NormalizedProduct {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      description: this.description,
      imageUrl: this.imageUrl,
      category: this.category,
      sku: this.sku,
      stock: this.stock,
      provider: this.provider,
      normalizedName: this.normalizedName,
      normalizedDescription: this.normalizedDescription,
      normalizedCategory: this.normalizedCategory,
      metadata: this.metadata,
    };
  }

  update(data: Partial<NormalizedProduct>): NormalizedProductEntity {
    // Validate updated data if provided
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
      throw new Error('NormalizedProduct price must be a non-negative number');
    }

    if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0)) {
      throw new Error('NormalizedProduct stock must be a non-negative number');
    }

    if (data.metadata?.qualityScore !== undefined) {
      const qualityScore = data.metadata.qualityScore;
      if (typeof qualityScore !== 'number' || qualityScore < 0 || qualityScore > 100) {
        throw new Error('Quality score must be a number between 0 and 100');
      }
    }

    // Update metadata if provided
    const updatedMetadata = data.metadata
      ? { ...this.metadata, ...data.metadata }
      : this.metadata;

    return new NormalizedProductEntity(
      data.id ?? this.id,
      data.name ?? this.name,
      data.price ?? this.price,
      data.description ?? this.description,
      data.imageUrl ?? this.imageUrl,
      data.category ?? this.category,
      data.sku ?? this.sku,
      data.stock ?? this.stock,
      data.provider ?? this.provider,
      data.normalizedName ?? this.normalizedName,
      data.normalizedDescription ?? this.normalizedDescription,
      data.normalizedCategory ?? this.normalizedCategory,
      updatedMetadata,
    );
  }
}
