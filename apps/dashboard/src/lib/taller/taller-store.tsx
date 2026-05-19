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
  addPiezaOrdenApi,
  assignMecanicoApi,
  createOrdenTrabajoApi,
  fetchOrdenesTrabajo,
  linkOrdenComercialApi,
  removePiezaOrdenApi,
  setPiezasOrdenApi,
  toggleChecklistItemApi,
  updateOrdenEstadoApi,
  updateOrdenTrabajoApi,
} from '@/lib/api/taller-api';
import type { OrdenTrabajo } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-store';
import type { OrdenEstado, OrdenTrabajoFormValues, PiezaUsada } from '@/lib/mock-data';

export type TallerContextValue = {
  ordenesTrabajo: OrdenTrabajo[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createOrdenTrabajo: (values: OrdenTrabajoFormValues) => Promise<OrdenTrabajo | null>;
  updateOrdenTrabajo: (id: string, values: OrdenTrabajoFormValues) => Promise<boolean>;
  updateOrdenEstado: (id: string, estado: OrdenEstado, nota?: string) => Promise<boolean>;
  toggleChecklistItem: (id: string, index: number) => Promise<boolean>;
  setPiezasUsadas: (id: string, piezas: PiezaUsada[]) => Promise<boolean>;
  addPieza: (id: string, pieza: PiezaUsada) => Promise<boolean>;
  removePieza: (id: string, piezaIndex: number) => Promise<boolean>;
  assignMecanico: (id: string, usuarioId: string) => Promise<boolean>;
  linkOrdenComercial: (id: string, ordenComercialId: string) => Promise<boolean>;
  getOrdenTrabajo: (id: string) => OrdenTrabajo | undefined;
  getOrdenesByCliente: (clienteId: string) => OrdenTrabajo[];
  getOrdenesByVehiculo: (vehiculoId: string) => OrdenTrabajo[];
  getOrdenesAbiertas: () => OrdenTrabajo[];
  getOrdenesAbiertasCount: () => number;
};

const TallerContext = createContext<TallerContextValue | null>(null);

function upsertOrden(list: OrdenTrabajo[], orden: OrdenTrabajo): OrdenTrabajo[] {
  const exists = list.some((item) => item.id === orden.id);
  if (exists) {
    return list.map((item) => (item.id === orden.id ? orden : item));
  }
  return [...list, orden];
}

export function TallerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<OrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setOrdenesTrabajo([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrdenesTrabajo();
      setOrdenesTrabajo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes de trabajo');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getOrdenTrabajo = useCallback(
    (id: string) => ordenesTrabajo.find((o) => o.id === id),
    [ordenesTrabajo],
  );

  const getOrdenesByCliente = useCallback(
    (clienteId: string) =>
      ordenesTrabajo
        .filter((o) => o.clienteId === clienteId)
        .sort((a, b) => b.fechaEntrada.localeCompare(a.fechaEntrada)),
    [ordenesTrabajo],
  );

  const getOrdenesByVehiculo = useCallback(
    (vehiculoId: string) =>
      ordenesTrabajo
        .filter((o) => o.vehiculoId === vehiculoId)
        .sort((a, b) => b.fechaEntrada.localeCompare(a.fechaEntrada)),
    [ordenesTrabajo],
  );

  const getOrdenesAbiertas = useCallback(
    () => ordenesTrabajo.filter((o) => o.estado !== 'completado'),
    [ordenesTrabajo],
  );

  const getOrdenesAbiertasCount = useCallback(
    () => ordenesTrabajo.filter((o) => o.estado !== 'completado').length,
    [ordenesTrabajo],
  );

  const createOrdenTrabajo = useCallback(
    async (values: OrdenTrabajoFormValues): Promise<OrdenTrabajo | null> => {
      try {
        const created = await createOrdenTrabajoApi(values);
        setOrdenesTrabajo((prev) =>
          [...prev, created].sort((a, b) => b.fechaEntrada.localeCompare(a.fechaEntrada)),
        );
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear la orden');
        return null;
      }
    },
    [],
  );

  const updateOrdenTrabajo = useCallback(
    async (id: string, values: OrdenTrabajoFormValues): Promise<boolean> => {
      try {
        const updated = await updateOrdenTrabajoApi(id, values);
        setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar la orden');
        return false;
      }
    },
    [],
  );

  const updateOrdenEstado = useCallback(
    async (id: string, estado: OrdenEstado, nota?: string): Promise<boolean> => {
      const existing = ordenesTrabajo.find((o) => o.id === id);
      if (!existing || existing.estado === estado) return false;

      try {
        const updated = await updateOrdenEstadoApi(id, estado, nota);
        setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cambiar el estado');
        return false;
      }
    },
    [ordenesTrabajo],
  );

  const toggleChecklistItem = useCallback(async (id: string, index: number): Promise<boolean> => {
    try {
      const updated = await toggleChecklistItemApi(id, index);
      setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar checklist');
      return false;
    }
  }, []);

  const setPiezasUsadas = useCallback(async (id: string, piezas: PiezaUsada[]): Promise<boolean> => {
    try {
      const updated = await setPiezasOrdenApi(id, piezas);
      setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar piezas');
      return false;
    }
  }, []);

  const addPieza = useCallback(async (id: string, pieza: PiezaUsada): Promise<boolean> => {
    try {
      const updated = await addPiezaOrdenApi(id, pieza);
      setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir pieza');
      return false;
    }
  }, []);

  const removePieza = useCallback(
    async (id: string, piezaIndex: number): Promise<boolean> => {
      const existing = ordenesTrabajo.find((o) => o.id === id);
      const line = existing?.piezasUsadas[piezaIndex];
      if (!line?.lineId) return false;

      try {
        const updated = await removePiezaOrdenApi(id, line.lineId);
        setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al quitar pieza');
        return false;
      }
    },
    [ordenesTrabajo],
  );

  const assignMecanico = useCallback(async (id: string, usuarioId: string): Promise<boolean> => {
    try {
      const updated = await assignMecanicoApi(id, usuarioId);
      setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar mecánico');
      return false;
    }
  }, []);

  const linkOrdenComercial = useCallback(
    async (id: string, ordenComercialId: string): Promise<boolean> => {
      try {
        const updated = await linkOrdenComercialApi(id, ordenComercialId);
        setOrdenesTrabajo((prev) => upsertOrden(prev, updated));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al vincular cotización');
        return false;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      ordenesTrabajo,
      loading,
      error,
      reload,
      createOrdenTrabajo,
      updateOrdenTrabajo,
      updateOrdenEstado,
      toggleChecklistItem,
      setPiezasUsadas,
      addPieza,
      removePieza,
      assignMecanico,
      linkOrdenComercial,
      getOrdenTrabajo,
      getOrdenesByCliente,
      getOrdenesByVehiculo,
      getOrdenesAbiertas,
      getOrdenesAbiertasCount,
    }),
    [
      ordenesTrabajo,
      loading,
      error,
      reload,
      createOrdenTrabajo,
      updateOrdenTrabajo,
      updateOrdenEstado,
      toggleChecklistItem,
      setPiezasUsadas,
      addPieza,
      removePieza,
      assignMecanico,
      linkOrdenComercial,
      getOrdenTrabajo,
      getOrdenesByCliente,
      getOrdenesByVehiculo,
      getOrdenesAbiertas,
      getOrdenesAbiertasCount,
    ],
  );

  return <TallerContext.Provider value={value}>{children}</TallerContext.Provider>;
}

export function useTallerStore() {
  const ctx = useContext(TallerContext);
  if (!ctx) {
    throw new Error('useTallerStore debe usarse dentro de TallerProvider');
  }
  return ctx;
}
