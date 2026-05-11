import { promises as fs } from 'fs';
import path from 'path';
import { ProviderSource } from '../../../domain/providers/ProviderSource';
import { IProviderRepository } from '../interfaces/IProviderRepository';

const getBaseProvidersDirectory = (): string => {
  // Use process.cwd() to get the backend directory, then resolve to data/providers
  return path.resolve(process.cwd(), 'data/providers');
};

const getProviderSourcesDirectory = (providerId: string): string => {
  return path.join(getBaseProvidersDirectory(), providerId, 'sources');
};

const formatTimestamp = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

export class ProviderFileRepository implements IProviderRepository {
  private async ensureProviderSourcesDirectory(providerId: string): Promise<void> {
    const sourcesDir = getProviderSourcesDirectory(providerId);
    try {
      await fs.access(sourcesDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(sourcesDir, { recursive: true });
    }
  }

  async saveSource(providerId: string, provider: string, products: any[]): Promise<string> {
    await this.ensureProviderSourcesDirectory(providerId);

    const timestamp = formatTimestamp();
    const filename = `products-${timestamp}.json`;
    const sourcesDir = getProviderSourcesDirectory(providerId);
    const filePath = path.join(sourcesDir, filename);

    const source: ProviderSource = {
      timestamp: new Date().toISOString(),
      provider,
      products,
    };

    try {
      await fs.writeFile(
        filePath,
        JSON.stringify(source, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`Failed to save source file to path: ${filePath}`, error);
      throw error;
    }

    return filename;
  }

  async readSource(providerId: string, filename: string): Promise<ProviderSource | null> {
    await this.ensureProviderSourcesDirectory(providerId);

    const sourcesDir = getProviderSourcesDirectory(providerId);
    const filePath = path.join(sourcesDir, filename);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const source: ProviderSource = JSON.parse(data);
      return source;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null;
      }
      throw new Error(`Failed to read source file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllSourceFiles(providerId?: string): Promise<string[]> {
    try {
      if (providerId) {
        // Get source files for specific provider
        const sourcesDir = getProviderSourcesDirectory(providerId);
        await this.ensureProviderSourcesDirectory(providerId);
        const files = await fs.readdir(sourcesDir);
        return files.filter(file => file.endsWith('.json'));
      } else {
        // Get source files from all providers
        const baseDir = getBaseProvidersDirectory();
        const allFiles: string[] = [];
        const providerDirs = await fs.readdir(baseDir, { withFileTypes: true });

        for (const providerDir of providerDirs) {
          if (providerDir.isDirectory()) {
            const sourcesDir = path.join(baseDir, providerDir.name, 'sources');
            try {
              const files = await fs.readdir(sourcesDir);
              const jsonFiles = files.filter(file => file.endsWith('.json'));
              allFiles.push(...jsonFiles);
            } catch (error) {
              // Skip providers without sources directory
              continue;
            }
          }
        }

        return allFiles;
      }
    } catch (error) {
      throw new Error(`Failed to read sources directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
