import { SubmissionEntity } from '../../../domain/entities/Submission/SubmissionEntity';
import { CreateSubmissionRequest } from '../../../presentation/requests/Submission/CreateSubmissionRequest';
import { CreateSubmissionResponse } from '../../../presentation/responses/Submission/CreateSubmissionResponse';
import { ISubmissionRepository } from '../../../infrastructure/fileSystem/fileRepository';

export class CreateSubmissionUseCase {
  constructor(private repository: ISubmissionRepository) {}

  async execute(request: CreateSubmissionRequest): Promise<CreateSubmissionResponse> {
    const submissions = await this.repository.findAll();
    const email = request.email.trim().toLowerCase();
    const emailAlreadyExists = submissions.some((s) => s.email.toLowerCase() === email);

    if (emailAlreadyExists) {
      throw new Error('This email has already been submitted');
    }

    const submission = SubmissionEntity.create(request);
    await this.repository.save(submission);

    return new CreateSubmissionResponse(submission);
  }
}
