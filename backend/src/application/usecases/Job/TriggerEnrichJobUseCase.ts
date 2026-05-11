import { runEnrichJob } from '../../../jobs/enrichJob';
import type { JobTriggerOutcome } from './TriggerImportJobUseCase';

export interface TriggerEnrichJobInput {
  providerId?: string;
  batchSize?: number;
}

export class TriggerEnrichJobUseCase {
  async execute(input: TriggerEnrichJobInput = {}): Promise<JobTriggerOutcome> {
    return runEnrichJob({ providerId: input.providerId, batchSize: input.batchSize });
  }
}
