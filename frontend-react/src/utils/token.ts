// JWT token utilities
export interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
  [key: string]: any;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

export function getToken(): string | null {
  return sessionStorage.getItem('authentication_token');
}

export function setToken(token: string): void {
  sessionStorage.setItem('authentication_token', token);
}

export function removeToken(): void {
  sessionStorage.removeItem('authentication_token');
}

