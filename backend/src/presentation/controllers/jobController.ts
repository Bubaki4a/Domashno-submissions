import { Router, Request, Response } from 'express';
import { getPipelineRunRepository } from '../../jobs/jobRunner';
import { createProductRepository } from '../../infrastructure/repositories/repositoryFactory';
import { ListPipelineRunsUseCase } from '../../application/usecases/Job/ListPipelineRunsUseCase';
import { GetPipelineRunByIdUseCase } from '../../application/usecases/Job/GetPipelineRunByIdUseCase';
import { TriggerImportJobUseCase } from '../../application/usecases/Job/TriggerImportJobUseCase';
import { TriggerEnrichJobUseCase } from '../../application/usecases/Job/TriggerEnrichJobUseCase';
import { ListFailedProductsUseCase } from '../../application/usecases/Job/ListFailedProductsUseCase';
import { RetryFailedProductsUseCase } from '../../application/usecases/Job/RetryFailedProductsUseCase';
import type { PipelineRun } from '../../domain/entities/PipelineRun/PipelineRun';
import type { PipelineRunStatus } from '../../domain/entities/PipelineRun/PipelineRun';

const router = Router();
const pipelineRunRepository = getPipelineRunRepository();
const productRepository = createProductRepository();

const listPipelineRunsUseCase = new ListPipelineRunsUseCase(pipelineRunRepository);
const getPipelineRunByIdUseCase = new GetPipelineRunByIdUseCase(pipelineRunRepository);
const triggerImportJobUseCase = new TriggerImportJobUseCase();
const triggerEnrichJobUseCase = new TriggerEnrichJobUseCase();
const listFailedProductsUseCase = new ListFailedProductsUseCase(productRepository);
const retryFailedProductsUseCase = new RetryFailedProductsUseCase(productRepository);

function toRunDto(run: PipelineRun) {
  return {
    id: run.id,
    jobName: run.jobName,
    providerId: run.providerId,
    status: run.status,
    startedAt: run.startedAt instanceof Date ? run.startedAt.toISOString() : run.startedAt,
    finishedAt: run.finishedAt ? (run.finishedAt instanceof Date ? run.finishedAt.toISOString() : run.finishedAt) : null,
    processedCount: run.processedCount,
    successCount: run.successCount,
    failedCount: run.failedCount,
    error: run.error,
    metadata: run.metadata,
  };
}

// POST /api/admin/jobs/import
router.post('/import', async (req: Request, res: Response) => {
  try {
    const providerId = req.body?.providerId as string | undefined;
    const outcome = await triggerImportJobUseCase.execute({ providerId });
    const statusCode = outcome.status === 'success' ? 200 : 207;
    res.status(statusCode).json({
      success: outcome.status === 'success',
      runId: outcome.runId,
      status: outcome.status,
      processedCount: outcome.processedCount,
      successCount: outcome.successCount,
      failedCount: outcome.failedCount,
      error: outcome.error,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

// POST /api/admin/jobs/enrich
router.post('/enrich', async (req: Request, res: Response) => {
  try {
    const providerId = req.body?.providerId as string | undefined;
    const batchSize = req.body?.batchSize as number | undefined;
    const outcome = await triggerEnrichJobUseCase.execute({ providerId, batchSize });
    const statusCode = outcome.status === 'success' ? 200 : 207;
    res.status(statusCode).json({
      success: outcome.status === 'success',
      runId: outcome.runId,
      status: outcome.status,
      processedCount: outcome.processedCount,
      successCount: outcome.successCount,
      failedCount: outcome.failedCount,
      error: outcome.error,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

// GET /api/admin/jobs
router.get('/', async (req: Request, res: Response) => {
  try {
    const jobName = req.query.job_name as string | undefined;
    const status = req.query.status as string | undefined;
    const limit = req.query.limit != null ? parseInt(String(req.query.limit), 10) : undefined;
    const runs = await listPipelineRunsUseCase.execute({
      jobName: jobName || undefined,
      status: status as PipelineRunStatus | undefined,
      limit,
    });
    res.status(200).json({ success: true, data: runs.map(toRunDto) });
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/jobs/failed-products (must be before /:id)
router.get('/failed-products', async (req: Request, res: Response) => {
  try {
    const providerId = req.query.provider_id as string | undefined;
    const rows = await listFailedProductsUseCase.execute({ providerId });
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error listing failed products:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/admin/jobs/retry-failed
router.post('/retry-failed', async (req: Request, res: Response) => {
  try {
    const providerId = req.body?.providerId as string | undefined;
    const count = await retryFailedProductsUseCase.execute({ providerId });
    res.status(200).json({ success: true, resetCount: count });
  } catch (error) {
    console.error('Error retrying failed products:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/jobs/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid job id' });
    }
    const run = await getPipelineRunByIdUseCase.execute(id);
    if (!run) {
      return res.status(404).json({ success: false, error: 'Job run not found' });
    }
    res.status(200).json({ success: true, data: toRunDto(run) });
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as jobRouter };
