import { Submission } from '../../../domain/entities/Submission/Submission';
import { Response } from '../Response';

export class GetSubmissionsResponse extends Response {
  data: Submission[];
  count: number;

  constructor(submissions: Submission[], success: boolean = true) {
    const mappedData = submissions.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      message: s.message,
      city: s.city,
      country: s.country,
      status: s.status,
      createdAt: s.createdAt,
      deletedAt: s.deletedAt ?? null,
    }));
    super(success, mappedData, 'Submissions retrieved successfully');
    this.data = mappedData;
    this.count = this.data.length;
  }
}
