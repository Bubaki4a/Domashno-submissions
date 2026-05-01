import { SubmissionEntity } from '../../../domain/entities/Submission/SubmissionEntity';
import { Submission } from '../../../domain/entities/Submission/Submission';
import { CreateSubmissionRequest } from '../../../presentation/requests/Submission/CreateSubmissionRequest';
import { UpdateSubmissionResponse } from '../../../presentation/responses/Submission/UpdateSubmissionResponse';
import { ISubmissionRepository } from '../../../infrastructure/fileSystem/fileRepository';

export class UpdateSubmissionUseCase {
  constructor(private repository: ISubmissionRepository) {}

  async execute(id: string, request: CreateSubmissionRequest): Promise<UpdateSubmissionResponse> {
    const updatedSubmission = SubmissionEntity.create(request);

    const submissions = await this.repository.findAll();
    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Submission not found');
    }

    const email = request.email.trim().toLowerCase();
    const emailAlreadyExists = submissions.some((s) => s.email.toLowerCase() === email && s.id !== id);

    if (emailAlreadyExists) {
      throw new Error('This email has already been submitted');
    }

    const existingSubmission = submissions[index];
    const updated: Submission = {
      ...updatedSubmission.toJSON(),
      id: existingSubmission.id,
      createdAt: existingSubmission.createdAt,
      deletedAt: existingSubmission.deletedAt ?? null,
    };

    submissions[index] = updated;
    await this.repository.saveAll(submissions);

    return new UpdateSubmissionResponse(updated);
  }
}
