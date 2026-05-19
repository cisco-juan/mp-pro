import { apiRequest, clearAuthSession, persistAuthSession } from './client';
import type { AuthSession, Usuario } from './types';

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const session = await apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  persistAuthSession(session);
  return session;
}

export async function logout(refreshToken?: string): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
      body: refreshToken ? { refreshToken } : {},
    });
  } finally {
    clearAuthSession();
  }
}

export async function fetchProfile(): Promise<Usuario> {
  return apiRequest<Usuario>('/auth/me');
}
