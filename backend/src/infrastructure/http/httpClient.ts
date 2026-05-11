export interface IHttpClient {
  get<T = any>(url: string, options?: RequestInit): Promise<T>;
  post<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>;
}

export class HttpClient implements IHttpClient {
  private baseUrl?: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string, defaultHeaders?: Record<string, string>) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders || {
      'Content-Type': 'application/json',
    };
  }

  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(fullUrl, config);

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorBody = await response.json();
            errorDetails = JSON.stringify(errorBody);
          } else {
            errorDetails = await response.text();
          }
        } catch {
          // Ignore errors when reading error response body
        }

        const errorMessage = `HTTP error! status: ${response.status}, statusText: ${response.statusText}${errorDetails ? `, body: ${errorDetails}` : ''}`;
        console.error(`HTTP request failed for URL: ${fullUrl}`, errorMessage);
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text() as T;
    } catch (error) {
      if (error instanceof Error) {
        // If it's already our formatted error, just rethrow it
        if (error.message.includes('HTTP error!')) {
          throw error;
        }
        // Otherwise, wrap it with more context
        console.error(`HTTP request failed for URL: ${fullUrl}`, error);
        throw new Error(`HTTP request failed: ${error.message}`);
      }
      console.error(`HTTP request failed for URL: ${fullUrl}`, 'Unknown error');
      throw new Error('HTTP request failed: Unknown error');
    }
  }

  async get<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    });
  }

  async post<T = any>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
