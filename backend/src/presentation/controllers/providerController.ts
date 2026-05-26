import { Router, Request, Response } from 'express';
import { IProvider } from '../../domain/providers/IProvider';
import { EasyGiftsProvider } from '../../infrastructure/providers/EasyGiftsProvider';
import { MidoceanProvider } from '../../infrastructure/providers/MidoceanProvider';
import { HttpClient } from '../../infrastructure/http/httpClient';
import { createProductRepository, createProviderRepository } from '../../infrastructure/repositories/repositoryFactory';
import { SyncProviderUseCase } from '../../application/usecases/Provider/SyncProviderUseCase';
import { ProcessProductsUseCase } from '../../application/usecases/Provider/ProcessProductsUseCase';
import { NormalizeProductsUseCase } from '../../application/usecases/Provider/NormalizeProductsUseCase';
import { GetProvidersUseCase } from '../../application/usecases/Provider/GetProvidersUseCase';
import { SyncProviderResponse } from '../responses/Provider/SyncProviderResponse';
import { NormalizeProductsResponse } from '../responses/Provider/NormalizeProductsResponse';
import { GetProvidersResponse } from '../responses/Provider/GetProvidersResponse';
import { requireRole } from '../../infrastructure/web/authMiddleware';

const router = Router();

const httpClient = new HttpClient();
const providerRepository = createProviderRepository();
const productRepository = createProductRepository();
const processProductsUseCase = new ProcessProductsUseCase(productRepository);
// КОРЕКЦИЯ ТУК: Добавяме providerRepository като втори аргумент
const normalizeProductsUseCase = new NormalizeProductsUseCase(productRepository, providerRepository);
const getProvidersUseCase = new GetProvidersUseCase(providerRepository, productRepository);

const createProviderInstance = async (providerSlug: string): Promise<IProvider> => {
  const providerData = await providerRepository.findProviderBySlug(providerSlug.toLowerCase());

  if (!providerData) {
    throw new Error(`Provider ${providerSlug} not found in database`);
  }

  switch (providerData.slug) {
    case 'easygifts':
      return new EasyGiftsProvider(httpClient, providerData.api_url);

    case 'midocean':
      return new MidoceanProvider(
        httpClient, 
        providerData.api_url, 
        providerData.api_key
      );

    default:
      throw new Error(`Unknown provider: ${providerSlug}`);
  }
};

router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = await getProvidersUseCase.execute();
    const response = new GetProvidersResponse(providers);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/providers/:provider/sync', requireRole(['administrator']), async (req, res) => {
  try {
    const { provider: providerSlug } = req.params;
    const providerRecord = await providerRepository.findProviderBySlug(providerSlug.toLowerCase());
    
    if (!providerRecord) throw new Error(`Provider ${providerSlug} not found`);

    const providerInstance = await createProviderInstance(providerSlug);

    const syncProviderUseCase = new SyncProviderUseCase(
      providerInstance,
      providerRecord.id,
      providerRepository,
      processProductsUseCase
    );

    const result = await syncProviderUseCase.execute();
    res.status(result.success ? 200 : 207).json(new SyncProviderResponse(result, result.success));
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to sync' });
  }
});

router.post('/providers/:provider/normalize', requireRole(['administrator']), async (req, res) => {
  try {
    const { provider } = req.params;
    const result = await normalizeProductsUseCase.execute(provider);
    const response = new NormalizeProductsResponse({
      processedCount: result.processedCount,
      errors: result.errors,
      provider,
    }, result.errors.length === 0);
    res.status(result.errors.length === 0 ? 200 : 207).json(response);
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to normalize' });
  }
});

export { router as providerRouter };