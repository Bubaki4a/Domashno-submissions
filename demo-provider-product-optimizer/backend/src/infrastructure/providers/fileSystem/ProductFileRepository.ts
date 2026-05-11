import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '../../../domain/entities/Product/Product';
import { ProductEntity } from '../../../domain/entities/Product/ProductEntity';
import { IProductRepository } from '../interfaces/IProductRepository';

const getBaseProvidersDirectory = (): string => {
  // Use process.cwd() to get the backend directory, then resolve to data/providers
  return path.resolve(process.cwd(), 'data/providers');
};

const getProviderProductsDirectory = (providerId: string): string => {
  return path.join(getBaseProvidersDirectory(), providerId, 'products');
};

export class ProductFileRepository implements IProductRepository {
  private async ensureProviderProductsDirectory(providerId: string): Promise<void> {
    const productsDir = getProviderProductsDirectory(providerId);
    try {
      await fs.access(productsDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(productsDir, { recursive: true });
    }
  }

  private getProductPath(providerId: string, id: string): string {
    const productsDir = getProviderProductsDirectory(providerId);
    const productDir = path.join(productsDir, id);
    return path.join(productDir, 'file.json');
  }

  private getNormalizedPath(providerId: string, id: string): string {
    const productsDir = getProviderProductsDirectory(providerId);
    const productDir = path.join(productsDir, id);
    return path.join(productDir, 'normalized.json');
  }

  async save(providerId: string, product: ProductEntity): Promise<void> {
    await this.ensureProviderProductsDirectory(providerId);

    const productPath = this.getProductPath(providerId, product.id);
    const productDir = path.dirname(productPath);

    // Ensure product directory exists
    try {
      await fs.access(productDir);
    } catch {
      await fs.mkdir(productDir, { recursive: true });
    }

    // Save product (overwrite if exists as per requirements)
    try {
      await fs.writeFile(
        productPath,
        JSON.stringify(product.toJSON(), null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`Failed to save product ${product.id} to path: ${productPath}`, error);
      throw error;
    }
  }

  async findById(providerId: string, id: string): Promise<Product | null> {
    await this.ensureProviderProductsDirectory(providerId);

    const productPath = this.getProductPath(providerId, id);

    try {
      const data = await fs.readFile(productPath, 'utf-8');
      const product: Product = JSON.parse(data);
      return product;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null;
      }
      throw new Error(`Failed to read product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(providerId?: string): Promise<Product[]> {
    const baseDir = getBaseProvidersDirectory();
    const products: Product[] = [];

    try {
      if (providerId) {
        // Get products for specific provider
        const productsDir = getProviderProductsDirectory(providerId);
        await this.ensureProviderProductsDirectory(providerId);

        const productDirs = await fs.readdir(productsDir, { withFileTypes: true });

        for (const dir of productDirs) {
          if (dir.isDirectory()) {
            const productPath = path.join(productsDir, dir.name, 'file.json');
            try {
              const data = await fs.readFile(productPath, 'utf-8');
              const product: Product = JSON.parse(data);
              products.push(product);
            } catch (error) {
              // Skip invalid product files
              console.warn(`Failed to read product ${dir.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      } else {
        // Get products from all providers
        const providerDirs = await fs.readdir(baseDir, { withFileTypes: true });

        for (const providerDir of providerDirs) {
          if (providerDir.isDirectory()) {
            const productsDir = path.join(baseDir, providerDir.name, 'products');
            try {
              const productDirs = await fs.readdir(productsDir, { withFileTypes: true });

              for (const dir of productDirs) {
                if (dir.isDirectory()) {
                  const productPath = path.join(productsDir, dir.name, 'file.json');
                  try {
                    const data = await fs.readFile(productPath, 'utf-8');
                    const product: Product = JSON.parse(data);
                    products.push(product);
                  } catch (error) {
                    // Skip invalid product files
                    console.warn(`Failed to read product ${dir.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }
              }
            } catch (error) {
              // Skip providers without products directory
              continue;
            }
          }
        }
      }

      return products;
    } catch (error) {
      throw new Error(`Failed to read products directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(providerId: string, id: string): Promise<void> {
    await this.ensureProviderProductsDirectory(providerId);

    const productPath = this.getProductPath(providerId, id);
    const productDir = path.dirname(productPath);

    try {
      // Delete the product file
      await fs.unlink(productPath);

      // Try to remove the directory if it's empty
      try {
        await fs.rmdir(productDir);
      } catch {
        // Directory not empty or doesn't exist, ignore
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Product doesn't exist, nothing to delete
        return;
      }
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveNormalized(providerId: string, id: string, normalizedData: any): Promise<void> {
    await this.ensureProviderProductsDirectory(providerId);

    const normalizedPath = this.getNormalizedPath(providerId, id);
    const productDir = path.dirname(normalizedPath);

    // Ensure product directory exists
    try {
      await fs.access(productDir);
    } catch {
      await fs.mkdir(productDir, { recursive: true });
    }

    // Save normalized data
    await fs.writeFile(
      normalizedPath,
      JSON.stringify(normalizedData, null, 2),
      'utf-8'
    );
  }

  async findNormalized(providerId: string, id: string): Promise<any | null> {
    await this.ensureProviderProductsDirectory(providerId);

    const normalizedPath = this.getNormalizedPath(providerId, id);

    try {
      const data = await fs.readFile(normalizedPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null;
      }
      throw new Error(`Failed to read normalized product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAllWithNormalized(providerId?: string): Promise<{ product: Product; hasNormalized: boolean }[]> {
    const baseDir = getBaseProvidersDirectory();
    const results: { product: Product; hasNormalized: boolean }[] = [];

    try {
      if (providerId) {
        // Get products for specific provider
        const productsDir = getProviderProductsDirectory(providerId);
        await this.ensureProviderProductsDirectory(providerId);

        const productDirs = await fs.readdir(productsDir, { withFileTypes: true });

        for (const dir of productDirs) {
          if (dir.isDirectory()) {
            const productPath = path.join(productsDir, dir.name, 'file.json');
            const normalizedPath = path.join(productsDir, dir.name, 'normalized.json');

            try {
              const data = await fs.readFile(productPath, 'utf-8');
              const product: Product = JSON.parse(data);

              // Check if normalized file exists
              let hasNormalized = false;
              try {
                await fs.access(normalizedPath);
                hasNormalized = true;
              } catch {
                hasNormalized = false;
              }

              results.push({ product, hasNormalized });
            } catch (error) {
              // Skip invalid product files
              console.warn(`Failed to read product ${dir.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      } else {
        // Get products from all providers
        const providerDirs = await fs.readdir(baseDir, { withFileTypes: true });

        for (const providerDir of providerDirs) {
          if (providerDir.isDirectory()) {
            const productsDir = path.join(baseDir, providerDir.name, 'products');
            try {
              const productDirs = await fs.readdir(productsDir, { withFileTypes: true });

              for (const dir of productDirs) {
                if (dir.isDirectory()) {
                  const productPath = path.join(productsDir, dir.name, 'file.json');
                  const normalizedPath = path.join(productsDir, dir.name, 'normalized.json');

                  try {
                    const data = await fs.readFile(productPath, 'utf-8');
                    const product: Product = JSON.parse(data);

                    // Check if normalized file exists
                    let hasNormalized = false;
                    try {
                      await fs.access(normalizedPath);
                      hasNormalized = true;
                    } catch {
                      hasNormalized = false;
                    }

                    results.push({ product, hasNormalized });
                  } catch (error) {
                    // Skip invalid product files
                    console.warn(`Failed to read product ${dir.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }
              }
            } catch (error) {
              // Skip providers without products directory
              continue;
            }
          }
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to read products directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
