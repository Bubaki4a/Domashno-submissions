import type { IPipelineRunRepository } from '../../../infrastructure/jobs/interface/IPipelineRunRepository';
import type { PipelineRun } from '../../../domain/entities/PipelineRun/PipelineRun';

export class GetPipelineRunByIdUseCase {
  constructor(private readonly pipelineRunRepository: IPipelineRunRepository) { }

  async execute(id: number): Promise<PipelineRun | null> {
    return this.pipelineRunRepository.findById(id);
  }
}
