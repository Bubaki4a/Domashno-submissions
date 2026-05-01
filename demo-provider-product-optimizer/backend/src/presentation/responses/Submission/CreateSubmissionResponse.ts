import { SubmissionEntity } from '../../../domain/entities/Submission/SubmissionEntity';
import { Response } from '../Response';

export class CreateSubmissionResponse extends Response {
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
    submission: SubmissionEntity,
    success: boolean = true,
    message: string = 'Submission created successfully'
  ) {
    const data = submission.toJSON();
    super(success, data, message);
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.message = data.message;
    this.city = data.city;
    this.country = data.country;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.deletedAt = data.deletedAt ?? null;
  }
}
