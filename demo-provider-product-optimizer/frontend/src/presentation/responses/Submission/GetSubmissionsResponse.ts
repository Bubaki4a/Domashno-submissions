import type { Submission } from '../../../domain/entities/Submission/Submission';
import type { Response } from '../Response';

export type GetSubmissionsResponse = Response<Submission[]> & {
  data: Submission[];
  count: number;
};
