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
  createServicioApi,
  fetchServicios,
  toggleServicioActivoApi,
  updateServicioApi,
  type Servicio,
} from '@/lib/api/servicios-api';
import { useAuth } from '@/lib/auth/auth-store';
import type { ServicioFormValues } from '@/lib/mock-data';

export const emptyServicioFormValues: ServicioFormValues = {
  nombre: '',
  descripcion: '',
  precio: '',
  duracionMin: '60',
  categoria: '',
};

export type ServiciosContextValue = {
  servicios: Servicio[];
  serviciosActivos: Servicio[];
  categorias: string[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getServicio: (id: string) => Servicio | undefined;
  getServicioNombre: (id: string) => string;
  createServicio: (values: ServicioFormValues) => Promise<Servicio | null>;
  updateServicio: (id: string, values: ServicioFormValues) => Promise<boolean>;
  toggleServicioActivo: (id: string) => Promise<boolean>;
};

const ServiciosContext = createContext<ServiciosContextValue | null>(null);

export function ServiciosProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setServicios([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchServicios();
      setServicios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const serviciosActivos = useMemo(
    () => servicios.filter((s) => s.activo),
    [servicios],
  );

  const categorias = useMemo(
    () => [...new Set(servicios.map((s) => s.categoria))].sort(),
    [servicios],
  );

  const getServicio = useCallback(
    (id: string) => servicios.find((s) => s.id === id),
    [servicios],
  );

  const getServicioNombre = useCallback(
    (id: string) => servicios.find((s) => s.id === id)?.nombre ?? 'Servicio desconocido',
    [servicios],
  );

  const createServicio = useCallback(
    async (values: ServicioFormValues): Promise<Servicio | null> => {
      if (!values.nombre.trim() || !values.categoria.trim()) return null;
      try {
        const servicio = await createServicioApi(values);
        setServicios((prev) => [...prev, servicio]);
        return servicio;
      } catch {
        return null;
      }
    },
    [],
  );

  const updateServicio = useCallback(
    async (id: string, values: ServicioFormValues): Promise<boolean> => {
      if (!values.nombre.trim() || !values.categoria.trim()) return false;
      try {
        const updated = await updateServicioApi(id, values);
        setServicios((prev) => prev.map((s) => (s.id === id ? updated : s)));
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const toggleServicioActivo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updated = await toggleServicioActivoApi(id);
      setServicios((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      servicios,
      serviciosActivos,
      categorias,
      loading,
      error,
      reload,
      getServicio,
      getServicioNombre,
      createServicio,
      updateServicio,
      toggleServicioActivo,
    }),
    [
      servicios,
      serviciosActivos,
      categorias,
      loading,
      error,
      reload,
      getServicio,
      getServicioNombre,
      createServicio,
      updateServicio,
      toggleServicioActivo,
    ],
  );

  return (
    <ServiciosContext.Provider value={value}>{children}</ServiciosContext.Provider>
  );
}

export function useServiciosStore() {
  const ctx = useContext(ServiciosContext);
  if (!ctx) {
    throw new Error('useServiciosStore debe usarse dentro de ServiciosProvider');
  }
  return ctx;
}
