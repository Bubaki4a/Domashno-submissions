import type { IPipelineRunRepository } from '../../../infrastructure/jobs/interface/IPipelineRunRepository';
import type { PipelineRun, ListPipelineRunsFilters } from '../../../domain/entities/PipelineRun/PipelineRun';

export class ListPipelineRunsUseCase {
  constructor(private readonly pipelineRunRepository: IPipelineRunRepository) { }

  async execute(filters?: ListPipelineRunsFilters): Promise<PipelineRun[]> {
    return this.pipelineRunRepository.findAll(filters);
  }
}
