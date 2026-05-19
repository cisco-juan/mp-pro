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
import {
  fetchConfiguracionTaller,
  updateConfiguracionTallerApi,
} from '@/lib/api/configuracion-api';
import { useAuth } from '@/lib/auth/auth-store';
import { defaultConfiguracionTaller, type ConfiguracionTaller } from '@/lib/mock-data';

export type ConfiguracionContextValue = {
  configuracion: ConfiguracionTaller;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateConfiguracion: (data: Partial<ConfiguracionTaller>) => Promise<boolean>;
};

const ConfiguracionContext = createContext<ConfiguracionContextValue | null>(null);

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [configuracion, setConfiguracion] = useState<ConfiguracionTaller>(
    defaultConfiguracionTaller,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setConfiguracion(defaultConfiguracionTaller);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchConfiguracionTaller();
      setConfiguracion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateConfiguracion = useCallback(
    async (data: Partial<ConfiguracionTaller>): Promise<boolean> => {
      try {
        const updated = await updateConfiguracionTallerApi(data);
        setConfiguracion(updated);
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ configuracion, loading, error, reload, updateConfiguracion }),
    [configuracion, loading, error, reload, updateConfiguracion],
  );

  return (
    <ConfiguracionContext.Provider value={value}>{children}</ConfiguracionContext.Provider>
  );
}

export function useConfiguracionStore() {
  const ctx = useContext(ConfiguracionContext);
  if (!ctx) {
    throw new Error('useConfiguracionStore debe usarse dentro de ConfiguracionProvider');
  }
  return ctx;
}
