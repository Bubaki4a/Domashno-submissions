import { Submission } from '../../../domain/entities/Submission/Submission';
import { Response } from '../Response';

export class UpdateSubmissionResponse extends Response {
  id: string;
  name: string;
  email: string;
  message: string;
  city: string;
  country: string;
  status: string;
  createdAt: string;
  deletedAt: string | null;

  constructor(
    submission: Submission,
    success: boolean = true,
    message: string = 'Submission updated successfully'
  ) {
    super(success, submission, message);
    this.id = submission.id;
    this.name = submission.name;
    this.email = submission.email;
    this.message = submission.message;
    this.city = submission.city;
    this.country = submission.country;
    this.status = submission.status;
    this.createdAt = submission.createdAt;
    this.deletedAt = submission.deletedAt ?? null;
  }
}
