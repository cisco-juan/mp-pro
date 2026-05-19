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
  adjustStockApi,
  createPiezaApi,
  fetchPiezas,
  reserveStockApi,
  updatePiezaApi,
} from '@/lib/api/inventario-api';
import type { Pieza } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-store';
import type { PiezaFormValues } from '@/lib/mock-data';

export const emptyPiezaFormValues: PiezaFormValues = {
  codigo: '',
  nombre: '',
  categoria: '',
  stock: '0',
  stockMinimo: '0',
  precioUnitario: '',
  ubicacion: '',
};

export type InventarioContextValue = {
  piezas: Pieza[];
  categorias: string[];
  stockBajoCount: number;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getPieza: (id: string) => Pieza | undefined;
  getPiezaNombre: (id: string) => string;
  createPieza: (values: PiezaFormValues) => Promise<Pieza | null>;
  updatePieza: (id: string, values: PiezaFormValues) => Promise<boolean>;
  adjustStock: (id: string, delta: number) => Promise<boolean>;
  reservarStock: (id: string, cantidad: number) => Promise<boolean>;
};

const InventarioContext = createContext<InventarioContextValue | null>(null);

export function InventarioProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setPiezas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPiezas();
      setPiezas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const categorias = useMemo(
    () => [...new Set(piezas.map((p) => p.categoria))].sort(),
    [piezas],
  );

  const stockBajoCount = useMemo(
    () => piezas.filter((p) => p.stock <= p.stockMinimo).length,
    [piezas],
  );

  const getPieza = useCallback(
    (id: string) => piezas.find((p) => p.id === id),
    [piezas],
  );

  const getPiezaNombre = useCallback(
    (id: string) => piezas.find((p) => p.id === id)?.nombre ?? 'Pieza desconocida',
    [piezas],
  );

  const createPieza = useCallback(
    async (values: PiezaFormValues): Promise<Pieza | null> => {
      const codigo = values.codigo.trim().toUpperCase();
      if (!codigo || !values.nombre.trim() || !values.categoria.trim()) {
        return null;
      }
      if (piezas.some((p) => p.codigo.toUpperCase() === codigo)) {
        return null;
      }

      try {
        const created = await createPiezaApi(values);
        setPiezas((prev) =>
          [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)),
        );
        return created;
      } catch {
        return null;
      }
    },
    [piezas],
  );

  const updatePieza = useCallback(
    async (id: string, values: PiezaFormValues): Promise<boolean> => {
      const existing = piezas.find((p) => p.id === id);
      if (!existing) return false;

      const codigo = values.codigo.trim().toUpperCase();
      if (piezas.some((p) => p.id !== id && p.codigo.toUpperCase() === codigo)) {
        return false;
      }

      try {
        const updated = await updatePiezaApi(id, values);
        setPiezas((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return true;
      } catch {
        return false;
      }
    },
    [piezas],
  );

  const adjustStock = useCallback(async (id: string, delta: number): Promise<boolean> => {
    if (!piezas.some((p) => p.id === id)) return false;

    try {
      const updated = await adjustStockApi(id, delta);
      setPiezas((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return true;
    } catch {
      return false;
    }
  }, [piezas]);

  const reservarStock = useCallback(
    async (id: string, cantidad: number): Promise<boolean> => {
      const pieza = piezas.find((p) => p.id === id);
      if (!pieza || cantidad < 1 || pieza.stock < cantidad) return false;

      try {
        const updated = await reserveStockApi(id, cantidad);
        setPiezas((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return true;
      } catch {
        return false;
      }
    },
    [piezas],
  );

  const value = useMemo(
    () => ({
      piezas,
      categorias,
      stockBajoCount,
      loading,
      error,
      reload,
      getPieza,
      getPiezaNombre,
      createPieza,
      updatePieza,
      adjustStock,
      reservarStock,
    }),
    [
      piezas,
      categorias,
      stockBajoCount,
      loading,
      error,
      reload,
      getPieza,
      getPiezaNombre,
      createPieza,
      updatePieza,
      adjustStock,
      reservarStock,
    ],
  );

  return (
    <InventarioContext.Provider value={value}>{children}</InventarioContext.Provider>
  );
}

export function useInventarioStore() {
  const ctx = useContext(InventarioContext);
  if (!ctx) {
    throw new Error('useInventarioStore debe usarse dentro de InventarioProvider');
  }
  return ctx;
}
