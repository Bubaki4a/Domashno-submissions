import { Router, Request, Response } from 'express';
import { IProvider } from '../../domain/providers/IProvider';
import { EasyGiftsProvider } from '../../infrastructure/providers/EasyGiftsProvider';
import { HttpClient } from '../../infrastructure/http/httpClient';
import { ProviderFileRepository } from '../../infrastructure/providers/fileSystem/ProviderFileRepository';
import { ProductFileRepository } from '../../infrastructure/providers/fileSystem/ProductFileRepository';
import { SyncProviderUseCase } from '../../application/usecases/Provider/SyncProviderUseCase';
import { ProcessProductsUseCase } from '../../application/usecases/Provider/ProcessProductsUseCase';
import { NormalizeProductsUseCase } from '../../application/usecases/Provider/NormalizeProductsUseCase';
import { GetProvidersUseCase } from '../../application/usecases/Provider/GetProvidersUseCase';
import { SyncProviderResponse } from '../responses/Provider/SyncProviderResponse';
import { NormalizeProductsResponse } from '../responses/Provider/NormalizeProductsResponse';
import { GetProvidersResponse } from '../responses/Provider/GetProvidersResponse';

const router = Router();

// Initialize dependencies (dependency injection)
const httpClient = new HttpClient();
const providerRepository = new ProviderFileRepository();
const productRepository = new ProductFileRepository();
const processProductsUseCase = new ProcessProductsUseCase(productRepository);
const normalizeProductsUseCase = new NormalizeProductsUseCase(productRepository);
const getProvidersUseCase = new GetProvidersUseCase(providerRepository, productRepository);

// Factory function to create provider instances
const createProvider = (providerName: string): IProvider => {
  const normalizedName = providerName.toLowerCase();

  switch (normalizedName) {
    case 'easygifts':
      const apiUrl = process.env.EASYGIFTS_API_URL;
      if (!apiUrl) {
        throw new Error('EASYGIFTS_API_URL environment variable is not set');
      }
      return new EasyGiftsProvider(httpClient, apiUrl);

    // Future providers can be added here
    // case 'anotherprovider':
    //   return new AnotherProvider(httpClient, process.env.ANOTHER_PROVIDER_API_URL);

    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
};

// Get list of providers
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = await getProvidersUseCase.execute();
    const response = new GetProvidersResponse(providers);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting providers:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to get providers'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Sync provider (Fetch)
router.post('/providers/:provider/sync', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;

    // Create provider instance
    const providerInstance = createProvider(provider);

    // Create sync use case
    const syncProviderUseCase = new SyncProviderUseCase(
      providerInstance,
      providerRepository,
      processProductsUseCase
    );

    // Execute sync
    const result = await syncProviderUseCase.execute();

    // Create response
    const response = new SyncProviderResponse(
      {
        provider: result.provider,
        sourceFilename: result.sourceFilename,
        productsCount: result.productsCount,
        processedCount: result.processedCount,
        errors: result.errors,
      },
      result.success,
      result.success
        ? `Successfully synchronized ${result.processedCount} products from ${result.provider}`
        : `Synchronization completed with ${result.errors.length} error(s)`
    );

    const statusCode = result.success ? 200 : 207; // 207 Multi-Status for partial success
    res.status(statusCode).json(response);
  } catch (error) {
    console.error('Error syncing provider:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to sync provider'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during provider sync'
    });
  }
});

// Normalize products
router.post('/providers/:provider/normalize', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;

    // Validate provider parameter
    if (!provider || provider.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Provider parameter is required',
        message: 'Failed to normalize products'
      });
    }

    // Execute normalize
    const result = await normalizeProductsUseCase.execute(provider);

    // Create response
    const response = new NormalizeProductsResponse(
      {
        processedCount: result.processedCount,
        errors: result.errors,
        provider,
      },
      result.errors.length === 0,
      result.errors.length === 0
        ? `Successfully normalized ${result.processedCount} products`
        : `Normalization completed with ${result.errors.length} error(s)`
    );

    const statusCode = result.errors.length === 0 ? 200 : 207; // 207 Multi-Status for partial success
    res.status(statusCode).json(response);
  } catch (error) {
    console.error('Error normalizing products:', error);

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to normalize products'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during normalization'
    });
  }
});

export { router as providerRouter };
