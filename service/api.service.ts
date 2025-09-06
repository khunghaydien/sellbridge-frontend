import axios from "axios";
// =================================================================
// 1. CÁC HẰNG SỐ VÀ CẤU HÌNH
// =================================================================

export const BASE_URL = process.env.NEXTAUTH_URL;
const FAILED_TO_REFRESH_TOKEN_ERROR = "FAILED_TO_REFRESH_TOKEN_ERROR";

// Các key để lưu token trong localStorage
const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

// =================================================================
// 2. DỊCH VỤ QUẢN LÝ TOKEN (TOKEN SERVICE)
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
export const tokenService = new TokenService();

// =================================================================
// 3. KHỞI TẠO CÁC INSTANCE AXIOS
// =================================================================

const axiosBase = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance cho các API cần xác thực (có token)
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance cho các API không cần xác thực (đăng nhập, đăng ký)
export const authApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =================================================================
// 4. LOGIC REFRESH TOKEN
// =================================================================
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Sử dụng axiosBase để tránh vòng lặp interceptor
    const response = await axiosBase.get("/auth/refresh-token", {
      params: {
        refreshToken: refreshToken,
      },
    });

    // Assert the type of response.data to avoid 'unknown' error
    const data = (
      response.data as { data: { accessToken: string } }
    ).data;
    const { accessToken } = data;
    tokenService.setTokens(accessToken, refreshToken);

    return accessToken;
  } catch (error) {
    tokenService.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
    throw new Error(FAILED_TO_REFRESH_TOKEN_ERROR);
  }
};

// =================================================================
// 5. INTERCEPTORS CHO API CẦN XÁC THỰC (`apiClient`)
// =================================================================

apiClient.interceptors.request.use(
  (config: any) => {
    const accessToken = tokenService.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý lỗi và tự động refresh token
apiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  async (error: any) => {
    const errorResponse = (error.response?.data as any)
    const errorMessage = errorResponse?.msg || errorResponse?.message || error.message || "unknown_error";
    
    if (errorMessage !== "Unauthorized") { 
      // TODO: Handle error message
    }
    
    const originalRequest = error.config as any & {
      _retry?: boolean;
    };
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      const errorStatus = error.response?.status || 500;
      return Promise.reject({ message: errorMessage, status: errorStatus });
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshToken();
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError: any) {
      processQueue(refreshError, null);
      if (refreshError.message === FAILED_TO_REFRESH_TOKEN_ERROR) {
        return Promise.reject({
          message: "Session expired. Please log in again.",
          status: 401,
        });
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// =================================================================
// 6. INTERCEPTORS CHO API KHÔNG CẦN XÁC THỰC (`authApiClient`)
// =================================================================

authApiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error: any) => {
    const errorResponse = (error.response?.data as any)
    const errorMessage = errorResponse?.msg || errorResponse?.message || error.message || "unknown_error";
    
    if (errorMessage !== "Unauthorized") { 
      // TODO: Handle error message
    }
    const errorStatus = error.response?.status || 500;
    return Promise.reject({ message: errorMessage, status: errorStatus });
  }
);
