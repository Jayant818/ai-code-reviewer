// Authentication utility functions

export const AUTH_TOKENS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

/**
 * Store authentication tokens in localStorage
 */
export function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKENS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(AUTH_TOKENS.REFRESH_TOKEN, refreshToken);
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKENS.ACCESS_TOKEN);
  }
  return null;
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKENS.REFRESH_TOKEN);
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!(getAccessToken() && getRefreshToken());
}

/**
 * Clear all authentication tokens
 */
export function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKENS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_TOKENS.REFRESH_TOKEN);
  }
}

/**
 * Decode JWT token (basic implementation)
 * In production, use a proper JWT library
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}
