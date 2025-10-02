import { RefreshTokenResponse, ApiError } from './types';
import { publicApi } from './public-api.service';
import { getRefreshToken } from './cookie-utils';

/**
 * Service để handle refresh token logic
 */
export class RefreshTokenService {
  private static instance: RefreshTokenService;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): RefreshTokenService {
    if (!RefreshTokenService.instance) {
      RefreshTokenService.instance = new RefreshTokenService();
    }
    return RefreshTokenService.instance;
  }

  /**
   * Thực hiện refresh token với retry logic
   * @param retryCount - Số lần retry hiện tại (default: 0)
   * @param maxRetries - Số lần retry tối đa (default: 3)
   * @returns Promise<boolean> - true nếu refresh thành công, false nếu thất bại
   */
  async refreshAccessToken(retryCount: number = 0, maxRetries: number = 3): Promise<boolean> {
    // Nếu đang trong quá trình refresh, chờ kết quả
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Kiểm tra refresh token có tồn tại không
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.warn('No refresh token found');
      return false;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh(retryCount, maxRetries, refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Thực hiện refresh token thực tế
   */
  private async performRefresh(
    retryCount: number,
    maxRetries: number,
    refreshToken: string
  ): Promise<boolean> {
    try {
      console.log(`Attempting to refresh token (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const response = await publicApi.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.success && response.data) {
        // Backend sẽ tự động set cookies mới
        console.log('Token refreshed successfully');
        return true;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error(`Refresh token attempt ${retryCount + 1} failed:`, error);

      // Nếu chưa đạt max retries và không phải lỗi 401/403, thử lại
      if (retryCount < maxRetries) {
        const apiError = error as ApiError;
        
        // Không retry nếu là lỗi authentication (401/403)
        if (apiError.status === 401 || apiError.status === 403) {
          console.error('Authentication error, not retrying');
          return false;
        }

        // Delay trước khi retry (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.performRefresh(retryCount + 1, maxRetries, refreshToken);
      }

      console.error('Max retries reached, refresh token failed');
      return false;
    }
  }

  /**
   * Kiểm tra xem có đang trong quá trình refresh không
   */
  isRefreshingInProgress(): boolean {
    return this.isRefreshing;
  }

  /**
   * Reset trạng thái refresh (dùng khi logout)
   */
  reset(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}

// Export singleton instance
export const refreshTokenService = RefreshTokenService.getInstance();
