'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile, login as loginApi, logout as logoutApi } from '@/lib/api/auth-api';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
} from '@/lib/api/client';
import type { Usuario } from '@/lib/api/types';

type AuthContextValue = {
  user: Usuario | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    setUser(profile);
  }, []);

  useEffect(() => {
    const token = getStoredAccessToken();
    const stored = getStoredUser();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(stored);
    refreshProfile()
      .catch(() => {
        clearAuthSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await loginApi(email, password);
      setUser(session.user);
      router.push('/');
    },
    [router],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshProfile,
    }),
    [user, loading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
