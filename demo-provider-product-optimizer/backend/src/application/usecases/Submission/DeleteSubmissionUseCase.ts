import { UpdateSubmissionResponse } from '../../../presentation/responses/Submission/UpdateSubmissionResponse';
import { ISubmissionRepository } from '../../../infrastructure/fileSystem/fileRepository';

export class DeleteSubmissionUseCase {
  constructor(private repository: ISubmissionRepository) {}

  async execute(id: string): Promise<UpdateSubmissionResponse> {
    const submissions = await this.repository.findAll();
    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Submission not found');
    }

    const submission = submissions[index];
    const updatedSubmission = {
      ...submission,
      deletedAt: new Date().toISOString(),
    };

    submissions[index] = updatedSubmission;
    await this.repository.saveAll(submissions);

    return new UpdateSubmissionResponse(updatedSubmission);
  }
}
