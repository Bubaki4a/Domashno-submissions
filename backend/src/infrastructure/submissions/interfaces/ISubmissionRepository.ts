import { Submission } from '../../../domain/entities/Submission/Submission';
import { SubmissionEntity } from '../../../domain/entities/Submission/SubmissionEntity';

export interface ISubmissionRepository {
  save(submission: SubmissionEntity): Promise<void>;
  findAll(): Promise<Submission[]>;
  findById(id: string): Promise<Submission | null>;
  saveAll(submissions: Submission[]): Promise<void>;
}
