import { createProductRepository } from '../infrastructure/repositories/repositoryFactory';
import { runJob } from './jobRunner';
import type { JobContext } from './jobRunner';
import type { ProductQualityCheckRow, ProductQualityStatus } from '../infrastructure/providers/interfaces/IProductRepository';
import { logJob } from '../infrastructure/logging/jobLogger';

const productRepository = createProductRepository();
const defaultBatchSize = Math.min(
  100,
  Math.max(10, parseInt(process.env.DATA_QUALITY_BATCH_SIZE || '25', 10) || 25),
);

export interface RunDataQualityJobOptions {
  providerId?: string;
  batchSize?: number;
}

interface QualityIssue {
  code: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

function isNonEmptyString(value?: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function addIssue(issues: QualityIssue[], code: string, field: string, message: string, severity: QualityIssue['severity'] = 'error'): void {
  issues.push({ code, field, message, severity });
}

function validateProduct(product: ProductQualityCheckRow): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (!isNonEmptyString(product.name)) {
    addIssue(issues, 'missing_name', 'name', 'Product name is required');
  }
  if (!isNonEmptyString(product.description)) {
    addIssue(issues, 'missing_description', 'description', 'Product description is required');
  }
  if (!isNonEmptyString(product.category)) {
    addIssue(issues, 'missing_category', 'category', 'Product category is required');
  }
  if (!isNonEmptyString(product.sku)) {
    addIssue(issues, 'missing_sku', 'sku', 'Catalog number (SKU) is required');
  }
  if (typeof product.price !== 'number' || Number.isNaN(product.price) || product.price <= 0) {
    addIssue(issues, 'invalid_price', 'price', 'Price must be a positive number');
  }

  if (!isNonEmptyString(product.normalizedName)) {
    addIssue(issues, 'missing_normalized_name', 'normalizedName', 'AI normalized name is required');
  }
  if (!isNonEmptyString(product.normalizedDescription)) {
    addIssue(issues, 'missing_normalized_description', 'normalizedDescription', 'AI normalized description is required');
  }
  if (!isNonEmptyString(product.events)) {
    addIssue(issues, 'missing_events', 'events', 'AI events suggestions are required');
  }
  if (!isNonEmptyString(product.audience)) {
    addIssue(issues, 'missing_audience', 'audience', 'AI audience suggestions are required');
  }
  if (!isNonEmptyString(product.emotion)) {
    addIssue(issues, 'missing_emotion', 'emotion', 'AI emotion suggestions are required');
  }

  return issues;
}

function determineQualityStatus(issues: QualityIssue[]): ProductQualityStatus {
  return issues.length === 0 ? 'ok' : 'issues';
}

export async function runDataQualityJob(options: RunDataQualityJobOptions = {}): Promise<{
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
    jobName: 'data_quality',
    providerId: providerId ?? null,
    jobFn: async (ctx: JobContext): Promise<{ processedCount: number; successCount: number; failedCount: number }> => {
      const products = await productRepository.findProductsForQualityCheck(providerId, batchSize);

      let processed = 0;
      let success = 0;
      let failed = 0;

      for (const product of products) {
        try {
          const issues = validateProduct(product);
          const qualityStatus = determineQualityStatus(issues);
          await productRepository.markProductQuality(product.providerId, product.id, qualityStatus, issues);

          if (issues.length > 0) {
            logJob({
              level: 'warn',
              job_name: 'data_quality',
              product_id: product.id,
              provider_id: product.providerId,
              message: 'product has quality issues',
              errors_count: issues.length,
            });
          } else {
            logJob({
              job_name: 'data_quality',
              product_id: product.id,
              provider_id: product.providerId,
              message: 'product passed quality checks',
            });
          }

          success++;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logJob({
            level: 'error',
            job_name: 'data_quality',
            product_id: product.id,
            provider_id: product.providerId,
            message: 'quality check failed for product',
            error: message,
          });
          failed++;
        }

        processed++;
        await ctx.updateCounts(processed, success, failed);
      }

      return {
        processedCount: processed,
        successCount: success,
        failedCount: failed,
      };
    },
  });
}