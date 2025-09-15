// =================================================================
// FETCH API SERVICE - PROFESSIONAL ARCHITECTURE
// =================================================================

export const BASE_URL = process.env.NEXTAUTH_URL;
const FAILED_TO_REFRESH_TOKEN_ERROR = "FAILED_TO_REFRESH_TOKEN_ERROR";

// Các key để lưu token trong localStorage
const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

// =================================================================
// TYPES & INTERFACES
// =================================================================

interface FetchOptions extends RequestInit {
  timeout?: number;
  baseURL?: string;
  requestKey?: string;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

interface ErrorResponse {
  message: string;
  status: number;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// =================================================================
// TOKEN SERVICE
// =================================================================

class TokenService {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken: string, refreshToken: string, remember: boolean = true): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  }

  clearTokens(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }
}

const tokenService = new TokenService();

// =================================================================
// BASE HTTP CLIENT - CORE FUNCTIONALITY
// =================================================================

class BaseHttpClient {
  protected baseURL: string;
  protected defaultTimeout: number = 30000;
  protected activeRequests = new Map<string, AbortController>();

  constructor(baseURL: string = BASE_URL || '') {
    this.baseURL = baseURL;
  }

  // Core request method
  protected async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      baseURL = this.baseURL,
      headers = {},
      requestKey,
      ...fetchOptions
    } = options;

    const url = `${baseURL}${endpoint}`;
    
    // Setup abort controller
    const controller = new AbortController();
    if (requestKey) {
      // Abort previous request with same key
      this.abortRequest(requestKey);
      this.activeRequests.set(requestKey, controller);
    }

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: defaultHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (requestKey) {
        this.activeRequests.delete(requestKey);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.msg || errorData?.message || `HTTP ${response.status}`;
        
        throw {
          message: errorMessage,
          status: response.status,
        } as ErrorResponse;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (requestKey) {
        this.activeRequests.delete(requestKey);
      }
      
      if (error.name === 'AbortError') {
        throw {
          message: 'Request was aborted',
          status: 0,
        } as ErrorResponse;
      }

      if (error.message && error.status) {
        throw error as ErrorResponse;
      }

      throw {
        message: error.message || 'Network error',
        status: 500,
      } as ErrorResponse;
    }
  }

  // HTTP Methods - DRY principle
  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Abort functionality
  abortRequest(requestKey: string): void {
    const controller = this.activeRequests.get(requestKey);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestKey);
    }
  }

  abortAllRequests(): void {
    this.activeRequests.forEach((controller) => {
      controller.abort();
    });
    this.activeRequests.clear();
  }
}

// =================================================================
// INTERCEPTORS & MIDDLEWARE
// =================================================================

// Auth Interceptor
class AuthInterceptor {
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  }[] = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string> {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${BASE_URL}/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Refresh token failed');
      }

      const data = await response.json();
      const { accessToken } = data.data;
      tokenService.setTokens(accessToken, refreshToken);

      return accessToken;
    } catch (error) {
      tokenService.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      throw new Error(FAILED_TO_REFRESH_TOKEN_ERROR);
    }
  }

  async addAuthHeader(headers: HeadersInit = {}): Promise<HeadersInit> {
    const accessToken = tokenService.getAccessToken();
    return {
      ...headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  async handleAuthError<T>(
    error: ErrorResponse,
    originalRequest: () => Promise<T>
  ): Promise<T> {
    if (error.status !== 401) {
      throw error;
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => originalRequest());
    }

    this.isRefreshing = true;

    try {
      await this.refreshToken();
      this.processQueue(null, null);
      return originalRequest();
    } catch (refreshError: any) {
      this.processQueue(refreshError, null);
      if (refreshError.message === FAILED_TO_REFRESH_TOKEN_ERROR) {
        throw {
          message: "Session expired. Please log in again.",
          status: 401,
        } as ErrorResponse;
      }
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }
}

// Stream Handler
class StreamHandler {
  async handleStream(
    url: string,
    options: RequestInit,
    onData: (chunk: string) => void,
    requestKey?: string,
    activeRequests?: Map<string, AbortController>
  ): Promise<void> {
    const controller = new AbortController();
    const key = requestKey || `STREAM_${Date.now()}`;

    if (activeRequests && requestKey) {
      activeRequests.set(key, controller);
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onData(chunk);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          message: 'Stream was aborted',
          status: 0,
        } as ErrorResponse;
      }
      throw error;
    } finally {
      if (activeRequests && requestKey) {
        activeRequests.delete(key);
      }
    }
  }
}

// File Upload Handler
class FileUploadHandler {
  async uploadFile<T>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>,
    options: RequestInit & { onProgress?: (progress: number) => void } = {}
  ): Promise<T> {
    const { onProgress, ...fetchOptions } = options;

    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.msg || errorData?.message || `HTTP ${response.status}`;
      
      throw {
        message: errorMessage,
        status: response.status,
      } as ErrorResponse;
    }

    const data = await response.json();
    return data;
  }

  async uploadMultipleFiles<T>(
    url: string,
    files: File[],
    fieldName: string = 'files',
    additionalData?: Record<string, any>,
    options: RequestInit & { onProgress?: (progress: number) => void } = {}
  ): Promise<T> {
    const { onProgress, ...fetchOptions } = options;

    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append(fieldName, file);
    });

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.msg || errorData?.message || `HTTP ${response.status}`;
      
      throw {
        message: errorMessage,
        status: response.status,
      } as ErrorResponse;
    }

    const data = await response.json();
    return data;
  }
}

// =================================================================
// MAIN API SERVICE - COMPOSITION PATTERN
// =================================================================

class FetchApiService {
  private httpClient: BaseHttpClient;
  private authInterceptor: AuthInterceptor;
  private streamHandler: StreamHandler;
  private fileUploadHandler: FileUploadHandler;

  constructor(baseURL?: string) {
    this.httpClient = new BaseHttpClient(baseURL);
    this.authInterceptor = new AuthInterceptor();
    this.streamHandler = new StreamHandler();
    this.fileUploadHandler = new FileUploadHandler();
  }

  // =================================================================
  // BASIC API METHODS (NO AUTH)
  // =================================================================
  get basic() {
    return {
      get: <T>(endpoint: string, options?: FetchOptions) => 
        this.httpClient.get<T>(endpoint, options),
      
      post: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
        this.httpClient.post<T>(endpoint, data, options),
      
      put: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
        this.httpClient.put<T>(endpoint, data, options),
      
      patch: <T>(endpoint: string, data?: any, options?: FetchOptions) => 
        this.httpClient.patch<T>(endpoint, data, options),
      
      delete: <T>(endpoint: string, options?: FetchOptions) => 
        this.httpClient.delete<T>(endpoint, options),
    };
  }

  // =================================================================
  // AUTHENTICATED API METHODS
  // =================================================================
  get auth() {
    return {
      get: async <T>(endpoint: string, options?: FetchOptions): Promise<T> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        
        try {
          return await this.httpClient.get<T>(endpoint, { ...options, headers });
        } catch (error: any) {
          return this.authInterceptor.handleAuthError(error, async () => {
            const retryHeaders = await this.authInterceptor.addAuthHeader(options?.headers);
            return this.httpClient.get<T>(endpoint, { ...options, headers: retryHeaders });
          });
        }
      },

      post: async <T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        
        try {
          return await this.httpClient.post<T>(endpoint, data, { ...options, headers });
        } catch (error: any) {
          return this.authInterceptor.handleAuthError(error, async () => {
            const retryHeaders = await this.authInterceptor.addAuthHeader(options?.headers);
            return this.httpClient.post<T>(endpoint, data, { ...options, headers: retryHeaders });
          });
        }
      },

      put: async <T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        
        try {
          return await this.httpClient.put<T>(endpoint, data, { ...options, headers });
        } catch (error: any) {
          return this.authInterceptor.handleAuthError(error, async () => {
            const retryHeaders = await this.authInterceptor.addAuthHeader(options?.headers);
            return this.httpClient.put<T>(endpoint, data, { ...options, headers: retryHeaders });
          });
        }
      },

      patch: async <T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        
        try {
          return await this.httpClient.patch<T>(endpoint, data, { ...options, headers });
        } catch (error: any) {
          return this.authInterceptor.handleAuthError(error, async () => {
            const retryHeaders = await this.authInterceptor.addAuthHeader(options?.headers);
            return this.httpClient.patch<T>(endpoint, data, { ...options, headers: retryHeaders });
          });
        }
      },

      delete: async <T>(endpoint: string, options?: FetchOptions): Promise<T> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        
        try {
          return await this.httpClient.delete<T>(endpoint, { ...options, headers });
        } catch (error: any) {
          return this.authInterceptor.handleAuthError(error, async () => {
            const retryHeaders = await this.authInterceptor.addAuthHeader(options?.headers);
            return this.httpClient.delete<T>(endpoint, { ...options, headers: retryHeaders });
          });
        }
      },
    };
  }

  // =================================================================
  // STREAMING METHODS
  // =================================================================
  get stream() {
    return {
      get: async (
        endpoint: string,
        onData: (chunk: string) => void,
        options?: FetchOptions
      ): Promise<void> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        const url = `${this.httpClient['baseURL']}${endpoint}`;
        
        return this.streamHandler.handleStream(
          url,
          { ...options, method: 'GET', headers },
          onData,
          options?.requestKey,
          this.httpClient['activeRequests']
        );
      },

      post: async (
        endpoint: string,
        data: any,
        onData: (chunk: string) => void,
        options?: FetchOptions
      ): Promise<void> => {
        const headers = await this.authInterceptor.addAuthHeader({
          'Content-Type': 'application/json',
          ...options?.headers,
        });
        const url = `${this.httpClient['baseURL']}${endpoint}`;
        
        return this.streamHandler.handleStream(
          url,
          { 
            ...options, 
            method: 'POST', 
            headers,
            body: JSON.stringify(data),
          },
          onData,
          options?.requestKey,
          this.httpClient['activeRequests']
        );
      },
    };
  }

  // =================================================================
  // FILE UPLOAD METHODS
  // =================================================================
  get files() {
    return {
      uploadSingle: async <T>(
        endpoint: string,
        file: File,
        fieldName: string = 'file',
        additionalData?: Record<string, any>,
        options?: FetchOptions & { onProgress?: (progress: number) => void }
      ): Promise<T> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        const url = `${this.httpClient['baseURL']}${endpoint}`;
        
        // Remove Content-Type to let browser set it with boundary for FormData
        const { 'Content-Type': _, ...headersWithoutContentType } = headers as any;
        
        return this.fileUploadHandler.uploadFile<T>(
          url,
          file,
          fieldName,
          additionalData,
          { ...options, headers: headersWithoutContentType }
        );
      },

      uploadMultiple: async <T>(
        endpoint: string,
        files: File[],
        fieldName: string = 'files',
        additionalData?: Record<string, any>,
        options?: FetchOptions & { onProgress?: (progress: number) => void }
      ): Promise<T> => {
        const headers = await this.authInterceptor.addAuthHeader(options?.headers);
        const url = `${this.httpClient['baseURL']}${endpoint}`;
        
        // Remove Content-Type to let browser set it with boundary for FormData
        const { 'Content-Type': _, ...headersWithoutContentType } = headers as any;
        
        return this.fileUploadHandler.uploadMultipleFiles<T>(
          url,
          files,
          fieldName,
          additionalData,
          { ...options, headers: headersWithoutContentType }
        );
      },
    };
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================
  abortRequest(requestKey: string): void {
    this.httpClient.abortRequest(requestKey);
  }

  abortAllRequests(): void {
    this.httpClient.abortAllRequests();
  }
}

// =================================================================
// EXPORTS - CLEAN API
// =================================================================

// Main service instance
export const apiService = new FetchApiService();

// Convenient aliases for different use cases
export const authFetchClient = apiService.basic;      // Auth APIs
export const apiFetchClient = apiService.auth;        // Authenticated APIs
export const streamFetchClient = apiService.stream;   // Streaming APIs
export const fileFetchClient = apiService.files;      // File upload APIs

// Utility functions
export const abortRequest = (requestKey: string) => apiService.abortRequest(requestKey);
export const abortAllPendingRequests = () => apiService.abortAllRequests();

// Export token service
export { tokenService };

// Export types
export type { FetchOptions, ApiResponse, ErrorResponse };

// Default export
export default apiService;