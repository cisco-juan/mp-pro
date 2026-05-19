'use client';

import { API_BASE_URL } from './config';
import type { AuthSession } from './types';

const ACCESS_TOKEN_KEY = 'mp_access_token';
const REFRESH_TOKEN_KEY = 'mp_refresh_token';
const USER_KEY = 'mp_user';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthSession['user'] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession['user'];
  } catch {
    return null;
  }
}

export function persistAuthSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  document.cookie = `mp_auth=1; path=/; max-age=${session.expiresIn}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'mp_auth=; path=/; max-age=0';
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearAuthSession();
    return null;
  }

  const session = (await res.json()) as AuthSession;
  persistAuthSession(session);
  return session.accessToken;
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getStoredAccessToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const execute = async (tokenOverride?: string) => {
    const finalHeaders = new Headers(requestHeaders);
    if (tokenOverride) {
      finalHeaders.set('Authorization', `Bearer ${tokenOverride}`);
    }

    return fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await execute();

  if (response.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await execute(newToken);
    }
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = undefined;
    }
    const message =
      typeof errorBody === 'object' &&
      errorBody !== null &&
      'message' in errorBody
        ? String((errorBody as { message: string | string[] }).message)
        : `Error ${response.status}`;
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : message,
      response.status,
      errorBody,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
