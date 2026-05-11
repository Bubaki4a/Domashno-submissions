import { SubmissionEntity } from '../../../domain/entities/Submission/SubmissionEntity';
import { Submission } from '../../../domain/entities/Submission/Submission';
import { CreateSubmissionRequest } from '../../../presentation/requests/Submission/CreateSubmissionRequest';
import { UpdateSubmissionResponse } from '../../../presentation/responses/Submission/UpdateSubmissionResponse';
import { ISubmissionRepository } from '../../../infrastructure/submissions/interfaces/ISubmissionRepository';

export class UpdateSubmissionUseCase {
  constructor(private repository: ISubmissionRepository) { }

  async execute(id: string, request: CreateSubmissionRequest): Promise<UpdateSubmissionResponse> {
    // Create entity with validation
    const updatedSubmission = SubmissionEntity.create(request);

    // Get all submissions
    const submissions = await this.repository.findAll();
    const index = submissions.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error('Submission not found');
    }

    // Update submission while preserving ID and createdAt
    const existingSubmission = submissions[index];
    const updated: Submission = {
      ...updatedSubmission.toJSON(),
      id: existingSubmission.id,
      createdAt: existingSubmission.createdAt, // Preserve original creation date
    };

    submissions[index] = updated;
    await this.repository.saveAll(submissions);

    return new UpdateSubmissionResponse(updated);
  }
}
