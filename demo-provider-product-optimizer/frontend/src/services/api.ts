import type { Submission } from '../domain/entities/Submission/Submission';
import type { CreateSubmissionRequest } from '../presentation/requests/Submission/CreateSubmissionRequest';
import type { UpdateSubmissionRequest } from '../presentation/requests/Submission/UpdateSubmissionRequest';
import type { Response } from '../presentation/responses/Response';
import type { CreateSubmissionResponse } from '../presentation/responses/Submission/CreateSubmissionResponse';
import type { GetSubmissionsResponse } from '../presentation/responses/Submission/GetSubmissionsResponse';
import type { UpdateSubmissionResponse } from '../presentation/responses/Submission/UpdateSubmissionResponse';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<Response<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async submitForm(request: CreateSubmissionRequest): Promise<Submission> {
    const response = await this.request<Submission>('/submit', {
      method: 'POST',
      body: JSON.stringify(request),
    }) as CreateSubmissionResponse;

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  }

  async getSubmissions(): Promise<Submission[]> {
    const response = await this.request<Submission[]>('/submissions', {
      method: 'GET',
    }) as GetSubmissionsResponse;

    return response.data || [];
  }

  async getSubmissionById(id: string): Promise<Submission> {
    const response = await this.request<Submission>(`/submissions/${id}`, {
      method: 'GET',
    }) as UpdateSubmissionResponse;

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  }

  async updateSubmission(id: string, request: UpdateSubmissionRequest): Promise<Submission> {
    const response = await this.request<Submission>(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    }) as UpdateSubmissionResponse;

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  }

  async deleteSubmission(id: string): Promise<Submission> {
    const response = await this.request<Submission>(`/submissions/${id}`, {
      method: 'DELETE',
    }) as UpdateSubmissionResponse;

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  }

  async restoreSubmission(id: string): Promise<Submission> {
    const response = await this.request<Submission>(`/submissions/${id}/restore`, {
      method: 'POST',
    }) as UpdateSubmissionResponse;

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  }
}

export const apiService = new ApiService();
