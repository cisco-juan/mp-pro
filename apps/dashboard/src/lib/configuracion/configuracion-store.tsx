'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  defaultConfiguracionTaller,
  type ConfiguracionTaller,
} from '@/lib/mock-data';

export type ConfiguracionContextValue = {
  configuracion: ConfiguracionTaller;
  updateConfiguracion: (data: Partial<ConfiguracionTaller>) => void;
};

const ConfiguracionContext = createContext<ConfiguracionContextValue | null>(null);

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionTaller>(
    defaultConfiguracionTaller
  );

  const updateConfiguracion = useCallback((data: Partial<ConfiguracionTaller>) => {
    setConfiguracion((prev) => ({ ...prev, ...data }));
  }, []);

  const value = useMemo(
    () => ({ configuracion, updateConfiguracion }),
    [configuracion, updateConfiguracion]
  );

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracionStore() {
  const ctx = useContext(ConfiguracionContext);
  if (!ctx) {
    throw new Error('useConfiguracionStore debe usarse dentro de ConfiguracionProvider');
  }
  return ctx;
}
