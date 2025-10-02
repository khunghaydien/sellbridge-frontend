import { COOKIE_NAMES } from './types';

/**
 * Đọc cookie value từ document.cookie
 * @param name - Tên cookie
 * @returns Giá trị cookie hoặc null nếu không tìm thấy
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  
  return null;
}

/**
 * Lấy access token từ cookie
 */
export function getAccessToken(): string | null {
  return getCookie(COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Lấy refresh token từ cookie
 */
export function getRefreshToken(): string | null {
  return getCookie(COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Kiểm tra xem có access token không
 */
export function hasAccessToken(): boolean {
  return !!getAccessToken();
}

/**
 * Kiểm tra xem có refresh token không
 */
export function hasRefreshToken(): boolean {
  return !!getRefreshToken();
}
