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
  convertCotizacionToFacturaApi,
  createCotizacionFromWorkOrderApi,
  fetchOrdenesComerciales,
  updateCotizacionEstadoApi,
  updateFacturaEstadoApi,
  type OrdenComercial,
} from '@/lib/api/ordenes-api';
import { fetchPagos, registerPagoApi, type Pago } from '@/lib/api/pagos-api';
import { useAuth } from '@/lib/auth/auth-store';
import type { CotizacionEstado, FacturaEstado, PagoFormValues } from '@/lib/mock-data';

export type OrdenesComercialesContextValue = {
  ordenesComerciales: OrdenComercial[];
  pagos: Pago[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  facturasPendientesCount: number;
  createCotizacionFromOrdenTrabajo: (ordenTrabajoId: string) => Promise<OrdenComercial>;
  getOrdenComercial: (id: string) => OrdenComercial | undefined;
  getOrdenComercialByOrdenTrabajoId: (ordenTrabajoId: string) => OrdenComercial | undefined;
  getOrdenesByCliente: (clienteId: string) => OrdenComercial[];
  getFacturasPendientes: () => OrdenComercial[];
  updateCotizacionEstado: (id: string, estado: CotizacionEstado) => Promise<boolean>;
  updateFacturaEstado: (id: string, estado: FacturaEstado) => Promise<boolean>;
  convertCotizacionToFactura: (cotizacionId: string) => Promise<OrdenComercial | null>;
  getPagosByOrdenComercialId: (ordenComercialId: string) => Pago[];
  getPagosByClienteId: (clienteId: string) => Pago[];
  getTotalPagado: (ordenComercialId: string) => number;
  registerPago: (values: PagoFormValues) => Promise<Pago | null>;
};

const OrdenesComercialesContext = createContext<OrdenesComercialesContextValue | null>(null);

export function OrdenesComercialesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [ordenesComerciales, setOrdenesComerciales] = useState<OrdenComercial[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setOrdenesComerciales([]);
      setPagos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [ordenes, pagosData] = await Promise.all([
        fetchOrdenesComerciales(),
        fetchPagos(),
      ]);
      setOrdenesComerciales(ordenes);
      setPagos(pagosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes comerciales');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getOrdenComercial = useCallback(
    (id: string) => ordenesComerciales.find((o) => o.id === id),
    [ordenesComerciales],
  );

  const getOrdenComercialByOrdenTrabajoId = useCallback(
    (ordenTrabajoId: string) =>
      ordenesComerciales.find((o) => o.ordenTrabajoId === ordenTrabajoId),
    [ordenesComerciales],
  );

  const getOrdenesByCliente = useCallback(
    (clienteId: string) => ordenesComerciales.filter((o) => o.clienteId === clienteId),
    [ordenesComerciales],
  );

  const getFacturasPendientes = useCallback(
    () => ordenesComerciales.filter((o) => o.tipo === 'factura' && o.estado === 'emitida'),
    [ordenesComerciales],
  );

  const facturasPendientesCount = useMemo(
    () => getFacturasPendientes().length,
    [getFacturasPendientes],
  );

  const getPagosByOrdenComercialId = useCallback(
    (ordenComercialId: string) =>
      pagos.filter((p) => p.ordenComercialId === ordenComercialId && p.monto > 0),
    [pagos],
  );

  const getTotalPagado = useCallback(
    (ordenComercialId: string) =>
      getPagosByOrdenComercialId(ordenComercialId).reduce((sum, p) => sum + p.monto, 0),
    [getPagosByOrdenComercialId],
  );

  const getPagosByClienteId = useCallback(
    (clienteId: string) => {
      const ordenIds = ordenesComerciales
        .filter((o) => o.clienteId === clienteId)
        .map((o) => o.id);
      return pagos.filter((p) => ordenIds.includes(p.ordenComercialId) && p.monto > 0);
    },
    [ordenesComerciales, pagos],
  );

  const createCotizacionFromOrdenTrabajo = useCallback(
    async (ordenTrabajoId: string): Promise<OrdenComercial> => {
      const cotizacion = await createCotizacionFromWorkOrderApi(ordenTrabajoId);
      setOrdenesComerciales((prev) => {
        const exists = prev.some((o) => o.id === cotizacion.id);
        return exists ? prev.map((o) => (o.id === cotizacion.id ? cotizacion : o)) : [...prev, cotizacion];
      });
      return cotizacion;
    },
    [],
  );

  const updateCotizacionEstado = useCallback(
    async (id: string, estado: CotizacionEstado): Promise<boolean> => {
      try {
        const updated = await updateCotizacionEstadoApi(id, estado);
        setOrdenesComerciales((prev) => prev.map((o) => (o.id === id ? updated : o)));
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const updateFacturaEstado = useCallback(
    async (id: string, estado: FacturaEstado): Promise<boolean> => {
      try {
        const updated = await updateFacturaEstadoApi(id, estado);
        setOrdenesComerciales((prev) => prev.map((o) => (o.id === id ? updated : o)));
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const convertCotizacionToFactura = useCallback(
    async (cotizacionId: string): Promise<OrdenComercial | null> => {
      try {
        const factura = await convertCotizacionToFacturaApi(cotizacionId);
        setOrdenesComerciales((prev) => {
          const updated = prev.map((o) =>
            o.id === cotizacionId ? { ...o, estado: 'convertida' as const } : o,
          );
          return [...updated, factura];
        });
        return factura;
      } catch {
        return null;
      }
    },
    [],
  );

  const registerPago = useCallback(
    async (values: PagoFormValues): Promise<Pago | null> => {
      try {
        const pago = await registerPagoApi(values);
        setPagos((prev) => [...prev, pago]);
        const orden = ordenesComerciales.find((o) => o.id === values.ordenComercialId);
        if (orden) {
          const pagado =
            getPagosByOrdenComercialId(values.ordenComercialId).reduce((s, p) => s + p.monto, 0) +
            pago.monto;
          if (pagado >= orden.total - 0.01) {
            setOrdenesComerciales((prev) =>
              prev.map((o) =>
                o.id === values.ordenComercialId ? { ...o, estado: 'pagada' } : o,
              ),
            );
          }
        }
        return pago;
      } catch {
        return null;
      }
    },
    [ordenesComerciales, getPagosByOrdenComercialId],
  );

  const value = useMemo(
    () => ({
      ordenesComerciales,
      pagos,
      loading,
      error,
      reload,
      facturasPendientesCount,
      createCotizacionFromOrdenTrabajo,
      getOrdenComercial,
      getOrdenComercialByOrdenTrabajoId,
      getOrdenesByCliente,
      getFacturasPendientes,
      updateCotizacionEstado,
      updateFacturaEstado,
      convertCotizacionToFactura,
      getPagosByOrdenComercialId,
      getPagosByClienteId,
      getTotalPagado,
      registerPago,
    }),
    [
      ordenesComerciales,
      pagos,
      loading,
      error,
      reload,
      facturasPendientesCount,
      createCotizacionFromOrdenTrabajo,
      getOrdenComercial,
      getOrdenComercialByOrdenTrabajoId,
      getOrdenesByCliente,
      getFacturasPendientes,
      updateCotizacionEstado,
      updateFacturaEstado,
      convertCotizacionToFactura,
      getPagosByOrdenComercialId,
      getPagosByClienteId,
      getTotalPagado,
      registerPago,
    ],
  );

  return (
    <OrdenesComercialesContext.Provider value={value}>
      {children}
    </OrdenesComercialesContext.Provider>
  );
}

export function useOrdenesComercialesStore() {
  const ctx = useContext(OrdenesComercialesContext);
  if (!ctx) {
    throw new Error(
      'useOrdenesComercialesStore debe usarse dentro de OrdenesComercialesProvider',
    );
  }
  return ctx;
}
