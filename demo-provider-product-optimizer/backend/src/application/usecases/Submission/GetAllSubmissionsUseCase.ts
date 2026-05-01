import { GetSubmissionsResponse } from '../../../presentation/responses/Submission/GetSubmissionsResponse';
import { ISubmissionRepository } from '../../../infrastructure/fileSystem/fileRepository';

export class GetAllSubmissionsUseCase {
  constructor(private repository: ISubmissionRepository) {}

  async execute(): Promise<GetSubmissionsResponse> {
    const submissions = await this.repository.findAll();

    // Sort by creation date (newest first)
    const sortedSubmissions = submissions.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return new GetSubmissionsResponse(sortedSubmissions);
  }
}
