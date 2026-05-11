import { IProvider } from '../domain/providers/IProvider';
import { SyncProviderUseCase } from '../application/usecases/Provider/SyncProviderUseCase';
import { ProcessProductsUseCase } from '../application/usecases/Provider/ProcessProductsUseCase';
import { GetProvidersUseCase } from '../application/usecases/Provider/GetProvidersUseCase';
import { createProductRepository, createProviderRepository } from '../infrastructure/repositories/repositoryFactory';
import { EasyGiftsProvider } from '../infrastructure/providers/EasyGiftsProvider';
import { runJob } from './jobRunner';
import type { JobContext } from './jobRunner';
import { HttpClient } from '../infrastructure/http/httpClient';
import { logJob } from '../infrastructure/logging/jobLogger';

const httpClient = new HttpClient();
const productRepository = createProductRepository();
const providerRepository = createProviderRepository();
const processProductsUseCase = new ProcessProductsUseCase(productRepository);
const getProvidersUseCase = new GetProvidersUseCase(providerRepository, productRepository);

function createProvider(providerName: string): IProvider {
  const normalizedName = providerName.toLowerCase();
  switch (normalizedName) {
    case 'easygifts': {
      const apiUrl = process.env.EASYGIFTS_API_URL;
      if (!apiUrl) throw new Error('EASYGIFTS_API_URL is not set');
      return new EasyGiftsProvider(httpClient, apiUrl);
    }
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

export interface RunImportJobOptions {
  providerId?: string;
}

/**
 * Run supplier import job: fetch products, upsert to DB, mark ai_status = 'pending'.
 * If providerId is set, sync only that provider; otherwise sync all configured providers.
 * Idempotent (upsert).
 */
export async function runImportJob(options: RunImportJobOptions = {}): Promise<{
  runId: number;
  status: 'success' | 'failed';
  processedCount: number;
  successCount: number;
  failedCount: number;
  error?: string;
}> {
  const { providerId } = options;

  return runJob({
    jobName: 'import',
    providerId: providerId ?? null,
    jobFn: async (ctx: JobContext): Promise<{ processedCount: number; successCount: number; failedCount: number }> => {
      const providersToSync: string[] = [];
      if (providerId) {
        providersToSync.push(providerId);
      } else {
        const providers = await getProvidersUseCase.execute();
        const configured = providers.filter((p) => p.isConfigured).map((p) => p.name);
        providersToSync.push(...configured);
      }

      if (providersToSync.length === 0) {
        await ctx.updateCounts(0, 0, 0);
        return { processedCount: 0, successCount: 0, failedCount: 0 };
      }

      let totalProcessed = 0;
      let totalSuccess = 0;
      let totalFailed = 0;

      for (const providerKey of providersToSync) {
        logJob({ job_name: 'import', provider_id: providerKey, message: 'sync provider started' });
        const provider = await createProvider(providerKey);
        const syncUseCase = new SyncProviderUseCase(
          provider,
          providerRepository,
          processProductsUseCase,
        );
        const result = await syncUseCase.execute();
        totalProcessed += result.processedCount + result.errors.length;
        totalSuccess += result.processedCount;
        totalFailed += result.errors.length;

        if (result.processedCount > 0) {
          const pid = providerKey.toLowerCase();
          await productRepository.setAiStatusByProvider(pid, 'pending');
        }
        logJob({
          job_name: 'import',
          provider_id: providerKey,
          message: 'sync provider finished',
          processed_count: result.processedCount,
          errors_count: result.errors.length,
        });
      }

      await ctx.updateCounts(totalProcessed, totalSuccess, totalFailed);
      return {
        processedCount: totalProcessed,
        successCount: totalSuccess,
        failedCount: totalFailed,
      };
    },
  });
}
