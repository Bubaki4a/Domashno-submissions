import { createProductRepository } from '../infrastructure/repositories/repositoryFactory';
import { createChatCompletionClient } from '../infrastructure/ai/aiClientFactory';
import { EnhanceProductUseCase } from '../application/usecases/Product/EnhanceProductUseCase';
import { runJob } from './jobRunner';
import type { JobContext } from './jobRunner';
import { logJob, getPromptVersion } from '../infrastructure/logging/jobLogger';

const productRepository = createProductRepository();
const defaultBatchSize = Math.min(
  100,
  Math.max(10, parseInt(process.env.ENRICH_BATCH_SIZE || '25', 10) || 25),
);

export interface RunEnrichJobOptions {
  providerId?: string;
  batchSize?: number;
}

/**
 * Run AI enrichment job: select products with ai_status = 'pending',
 * call DeepInfra for events, persist to product_normalized and set ai_status.
 * Safe for re-run; single product failure does not stop the job.
 */
export async function runEnrichJob(options: RunEnrichJobOptions = {}): Promise<{
  runId: number;
  status: 'success' | 'failed';
  processedCount: number;
  successCount: number;
  failedCount: number;
  error?: string;
}> {
  const batchSize = options.batchSize ?? defaultBatchSize;
  const providerId = options.providerId;

  return runJob({
    jobName: 'enrich',
    providerId: providerId ?? null,
    jobFn: async (ctx: JobContext): Promise<{ processedCount: number; successCount: number; failedCount: number }> => {
      const chatClient = createChatCompletionClient();
      const enhanceUseCase = new EnhanceProductUseCase(productRepository, chatClient);

      const pending = await productRepository.findByAiStatus(
        'pending',
        providerId,
        batchSize,
      );

      let processed = 0;
      let success = 0;
      let failed = 0;

      const model = process.env.DEEP_INFRA_MODEL || 'nvidia/Nemotron-3-Nano-30B-A3B';
      const promptVersion = getPromptVersion();

      for (const { id: productId, providerId: pid } of pending) {
        logJob({
          job_name: 'enrich',
          product_id: productId,
          provider_id: pid,
          model,
          prompt_version: promptVersion,
          message: 'enrich product started',
        });
        try {
          const result = await enhanceUseCase.execute({ providerId: pid, productId });
          await productRepository.saveNormalized(pid, productId, {
            ...result.product,
            events: result.events,
          });
          await productRepository.updateAiStatus(pid, productId, 'completed', null);
          success++;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logJob({
            level: 'warn',
            job_name: 'enrich',
            product_id: productId,
            provider_id: pid,
            model,
            prompt_version: promptVersion,
            message: 'enrich product failed',
            error: message,
          });
          await productRepository.updateAiStatus(pid, productId, 'failed', message);
          failed++;
        }
        processed++;
        await ctx.updateCounts(processed, success, failed);

        break; //do not remove this!!! - added by Kalin. Work only with single product for development.

      }

      console.log('processed', processed);

      return {
        processedCount: processed,
        successCount: success,
        failedCount: failed,
      };
    },
  });
}
