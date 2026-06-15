import { runDataQualityJob } from '../../../jobs/dataQualityJob';
import type { JobTriggerOutcome, TriggerImportJobInput } from './TriggerImportJobUseCase';

export interface TriggerDataQualityJobInput extends TriggerImportJobInput {
  batchSize?: number;
}

export class TriggerDataQualityJobUseCase {
  async execute(input: TriggerDataQualityJobInput = {}): Promise<JobTriggerOutcome> {
    return runDataQualityJob({ providerId: input.providerId, batchSize: input.batchSize });
  }
}