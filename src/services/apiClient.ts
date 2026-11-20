import { User } from '../types';

export const TOKEN_KEY = 'skillswap_auth_token';
export const USER_KEY = 'skillswap_auth_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === 'undefined') return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.profile ? parsed : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore storage errors
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers?.get?.('content-type');
  if (contentType && !contentType.includes('application/json')) {
    throw new Error(
      `API endpoint "${endpoint}" returned a non-JSON response (${contentType}). Ensure the backend server is running via "bun run dev".`
    );
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    if (response.ok) {
      throw new Error(
        `Invalid JSON response from "${endpoint}". Ensure the backend server is running via "bun run dev".`
      );
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
