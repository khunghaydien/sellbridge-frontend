import { ApiResponse, ApiError, RequestConfig } from './types';

/**
 * Public API Service - Không cần access token
 * Sử dụng cho các API endpoints công khai như đăng ký, đăng nhập, forgot password, etc.
 */
export class PublicApiService {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3030') {
    this.baseUrl = baseUrl;
  }

  /**
   * Thực hiện request đến API endpoint công khai
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = 'no-cache',
      credentials = 'include', // Để cookies được gửi kèm
    } = config;

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        cache,
        credentials,
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || data.error || 'Request failed',
          status: response.status,
          code: data.code,
        };
        throw error;
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
      throw apiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }
}

// Export singleton instance
export const publicApi = new PublicApiService();
