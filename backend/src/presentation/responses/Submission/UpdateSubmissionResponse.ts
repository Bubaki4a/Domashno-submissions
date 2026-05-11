import { Submission } from '../../../domain/entities/Submission/Submission';
import { Response } from '../Response';

export class UpdateSubmissionResponse extends Response {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;

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
    this.createdAt = submission.createdAt;
  }
}
