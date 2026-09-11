const TOKEN_STORAGE_KEY = 'behouse_access_token';

/**
 * Stockage simple en localStorage pour le MVP.
 * TODO (V1) : envisager un cookie httpOnly signé côté backend pour réduire
 * l'exposition du token aux attaques XSS, une fois le besoin de SSR
 * authentifié (dashboards) confirmé.
 */
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
