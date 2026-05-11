import { Product } from './Product';

export class ProductEntity {
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
    public readonly providerData: Record<string, any> | undefined,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) { }

  static create(data: Partial<Product> & { id: string; name: string }): ProductEntity {
    // Validation
    if (!data.id || data.id.trim().length === 0) {
      throw new Error('Product ID is required');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    // Validate price if provided
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
      throw new Error('Product price must be a non-negative number');
    }

    // Validate stock if provided
    if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0)) {
      throw new Error('Product stock must be a non-negative number');
    }

    const now = new Date().toISOString();

    return new ProductEntity(
      data.id.trim(),
      data.name.trim(),
      data.price,
      data.description?.trim(),
      data.imageUrl?.trim(),
      data.category?.trim(),
      data.sku?.trim(),
      data.stock,
      data.provider?.trim(),
      data.providerData,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  static fromData(data: Product): ProductEntity {
    return new ProductEntity(
      data.id,
      data.name,
      data.price,
      data.description,
      data.imageUrl,
      data.category,
      data.sku,
      data.stock,
      data.provider,
      data.providerData,
      data.createdAt,
      data.updatedAt
    );
  }

  toJSON(): Product {
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
      providerData: this.providerData,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(data: Partial<Product>): ProductEntity {
    const now = new Date().toISOString();
    
    return new ProductEntity(
      data.id ?? this.id,
      data.name ?? this.name,
      data.price ?? this.price,
      data.description ?? this.description,
      data.imageUrl ?? this.imageUrl,
      data.category ?? this.category,
      data.sku ?? this.sku,
      data.stock ?? this.stock,
      data.provider ?? this.provider,
      data.providerData ?? this.providerData,
      this.createdAt,
      now
    );
  }
}
