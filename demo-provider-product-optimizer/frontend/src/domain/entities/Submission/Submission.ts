export type SubmissionStatus = 'Open' | 'In Review' | 'Approved' | 'Declined';

export interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  city: string;
  country: string;
  status: SubmissionStatus;
  createdAt: string;
  deletedAt?: string | null;
}
