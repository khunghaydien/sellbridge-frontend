import { ApiResponse, ApiError, RequestConfig } from './types';
import { getAccessToken, hasAccessToken } from './cookie-utils';
import { refreshTokenService } from './refresh-token.service';

/**
 * Authenticated API Service - Cần access token
 * Tự động handle refresh token khi gặp lỗi 401
 */
export class AuthApiService {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3030') {
    this.baseUrl = baseUrl;
  }

  /**
   * Thực hiện request đến API endpoint cần authentication
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = 'no-cache',
      credentials = 'include',
    } = config;

    const url = `${this.baseUrl}${endpoint}`;

    // Lấy access token từ cookie (nếu có thể đọc được)
    const accessToken = getAccessToken();
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Chỉ thêm Authorization header nếu có thể đọc được token
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        cache,
        credentials, // HttpOnly cookies sẽ được gửi tự động
      });

      const data = await response.json();

      // Nếu gặp lỗi 401 và chưa phải là retry
      if (response.status === 401 && !isRetry && hasAccessToken()) {
        console.log('Received 401, attempting to refresh token...');
        
        // Thử refresh token
        const refreshSuccess = await refreshTokenService.refreshAccessToken();
        
        if (refreshSuccess) {
          console.log('Token refreshed successfully, retrying original request...');
          // Retry request với token mới
          return this.request<T>(endpoint, config, true);
        } else {
          console.error('Failed to refresh token');
          const error: ApiError = {
            message: 'Authentication failed and refresh token expired',
            status: 401,
            code: 'REFRESH_FAILED',
          };
          throw error;
        }
      }

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

  /**
   * Upload file với multipart/form-data
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const accessToken = getAccessToken();
    
    if (!accessToken) {
      const error: ApiError = {
        message: 'No access token found',
        status: 401,
        code: 'NO_TOKEN',
      };
      throw error;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          ...headers,
          // Không set Content-Type, để browser tự set với boundary cho multipart
        },
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || data.error || 'Upload failed',
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
        message: error instanceof Error ? error.message : 'Upload failed',
        status: 0,
      };
      throw apiError;
    }
  }
}

// Export singleton instance
export const authApi = new AuthApiService();
