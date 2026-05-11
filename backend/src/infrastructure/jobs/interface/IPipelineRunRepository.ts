import type {
  PipelineRun,
  CreatePipelineRunInput,
  UpdatePipelineRunInput,
  ListPipelineRunsFilters,
} from '../../../domain/entities/PipelineRun/PipelineRun';

export interface IPipelineRunRepository {
  create(input: CreatePipelineRunInput): Promise<PipelineRun>;
  update(id: number, input: UpdatePipelineRunInput): Promise<void>;
  findById(id: number): Promise<PipelineRun | null>;
  findAll(filters?: ListPipelineRunsFilters): Promise<PipelineRun[]>;
  findRunningByJobName(jobName: string): Promise<PipelineRun | null>;
}
