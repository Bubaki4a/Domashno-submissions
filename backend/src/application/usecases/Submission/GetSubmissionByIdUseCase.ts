import { UpdateSubmissionResponse } from '../../../presentation/responses/Submission/UpdateSubmissionResponse';
import { ISubmissionRepository } from '../../../infrastructure/submissions/interfaces/ISubmissionRepository';

export class GetSubmissionByIdUseCase {
  constructor(private repository: ISubmissionRepository) { }

  async execute(id: string): Promise<UpdateSubmissionResponse> {
    const submission = await this.repository.findById(id);

    if (!submission) {
      throw new Error('Submission not found');
    }

    return new UpdateSubmissionResponse(submission);
  }
}
