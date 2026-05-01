import type { SubmissionStatus } from '../../../domain/entities/Submission/Submission';

export interface UpdateSubmissionRequest {
  name: string;
  email: string;
  message: string;
  city: string;
  country: string;
  status: SubmissionStatus;
}
