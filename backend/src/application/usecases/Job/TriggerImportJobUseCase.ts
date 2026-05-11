import { runImportJob } from '../../../jobs/importJob';

export interface JobTriggerOutcome {
  runId: number;
  status: 'success' | 'failed';
  processedCount: number;
  successCount: number;
  failedCount: number;
  error?: string;
}

export interface TriggerImportJobInput {
  providerId?: string;
}

export class TriggerImportJobUseCase {
  async execute(input: TriggerImportJobInput = {}): Promise<JobTriggerOutcome> {
    return runImportJob({ providerId: input.providerId });
  }
}
