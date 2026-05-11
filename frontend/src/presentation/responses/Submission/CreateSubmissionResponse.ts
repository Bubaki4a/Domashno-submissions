import type { Submission } from '../../../domain/entities/Submission/Submission';
import type { Response } from '../Response';

export type CreateSubmissionResponse = Response<Submission> & {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};
