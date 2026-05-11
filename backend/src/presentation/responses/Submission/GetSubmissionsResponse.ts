import { Submission } from '../../../domain/entities/Submission/Submission';
import { Response } from '../Response';

export class GetSubmissionsResponse extends Response {
  data: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
  }>;
  count: number;

  constructor(submissions: Submission[], success: boolean = true) {
    const mappedData = submissions.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      message: s.message,
      createdAt: s.createdAt,
    }));
    super(success, mappedData, 'Submissions retrieved successfully');
    this.data = mappedData;
    this.count = this.data.length;
  }
}
