'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  ordenesComerciales as initialOrdenes,
  pagos as initialPagos,
  MOCK_TODAY,
  type CotizacionEstado,
  type FacturaEstado,
  type LineaOrden,
  type OrdenComercial,
  type OrdenTrabajo,
  type Pago,
  type PagoFormValues,
  type PagoMetodo,
} from '@/lib/mock-data';

type State = {
  ordenesComerciales: OrdenComercial[];
  pagos: Pago[];
};

type Action =
  | { type: 'ADD_ORDEN'; orden: OrdenComercial }
  | { type: 'UPDATE_ORDEN'; id: string; data: Partial<OrdenComercial> }
  | { type: 'ADD_PAGO'; pago: Pago };

function generateOrdenComercialId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `oc${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `oc${n}`;
  }
  return id;
}

function generatePagoId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `pg${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `pg${n}`;
  }
  return id;
}

function generateCotizacionNumero(existing: { numero: string }[]): string {
  const year = new Date(MOCK_TODAY).getFullYear();
  const prefix = `COT-${year}-`;
  const nums = existing
    .filter((o) => o.numero.startsWith(prefix))
    .map((o) => {
      const match = o.numero.match(new RegExp(`^${prefix}(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 100;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

function generateFacturaNumero(existing: { numero: string }[]): string {
  const year = new Date(MOCK_TODAY).getFullYear();
  const prefix = `FAC-${year}-`;
  const nums = existing
    .filter((o) => o.numero.startsWith(prefix))
    .map((o) => {
      const match = o.numero.match(new RegExp(`^${prefix}(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 50;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildLineasFromOrdenTrabajo(
  orden: OrdenTrabajo,
  lineIdStart: number,
  getPiezaNombre: (id: string) => string
): LineaOrden[] {
  const lineas: LineaOrden[] = [];
  let lineNum = lineIdStart;

  if (orden.descripcion.trim()) {
    lineas.push({
      id: `l${lineNum}`,
      tipo: 'servicio',
      referenciaId: 'sv-custom',
      descripcion: orden.descripcion,
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0,
    });
    lineNum += 1;
  }

  for (const pu of orden.piezasUsadas) {
    const subtotal = pu.cantidad * pu.precioUnitario;
    lineas.push({
      id: `l${lineNum}`,
      tipo: 'pieza',
      referenciaId: pu.piezaId,
      descripcion: getPiezaNombre(pu.piezaId),
      cantidad: pu.cantidad,
      precioUnitario: pu.precioUnitario,
      subtotal,
    });
    lineNum += 1;
  }

  return lineas;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ORDEN':
      return { ...state, ordenesComerciales: [...state.ordenesComerciales, action.orden] };
    case 'UPDATE_ORDEN':
      return {
        ...state,
        ordenesComerciales: state.ordenesComerciales.map((o) =>
          o.id === action.id ? { ...o, ...action.data } : o
        ),
      };
    case 'ADD_PAGO':
      return { ...state, pagos: [...state.pagos, action.pago] };
    default:
      return state;
  }
}

export type OrdenesComercialesContextValue = {
  ordenesComerciales: OrdenComercial[];
  pagos: Pago[];
  facturasPendientesCount: number;
  createCotizacionFromOrdenTrabajo: (
    orden: OrdenTrabajo,
    getPiezaNombre: (id: string) => string
  ) => OrdenComercial;
  getOrdenComercial: (id: string) => OrdenComercial | undefined;
  getOrdenComercialByOrdenTrabajoId: (ordenTrabajoId: string) => OrdenComercial | undefined;
  getOrdenesByCliente: (clienteId: string) => OrdenComercial[];
  getFacturasPendientes: () => OrdenComercial[];
  updateCotizacionEstado: (id: string, estado: CotizacionEstado) => boolean;
  updateFacturaEstado: (id: string, estado: FacturaEstado) => boolean;
  convertCotizacionToFactura: (cotizacionId: string) => OrdenComercial | null;
  getPagosByOrdenComercialId: (ordenComercialId: string) => Pago[];
  getPagosByClienteId: (clienteId: string) => Pago[];
  getTotalPagado: (ordenComercialId: string) => number;
  registerPago: (values: PagoFormValues) => Pago | null;
};

const OrdenesComercialesContext = createContext<OrdenesComercialesContextValue | null>(null);

export function OrdenesComercialesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ordenesComerciales: initialOrdenes,
    pagos: initialPagos,
  });

  const getOrdenComercial = useCallback(
    (id: string) => state.ordenesComerciales.find((o) => o.id === id),
    [state.ordenesComerciales]
  );

  const getOrdenComercialByOrdenTrabajoId = useCallback(
    (ordenTrabajoId: string) =>
      state.ordenesComerciales.find((o) => o.ordenTrabajoId === ordenTrabajoId),
    [state.ordenesComerciales]
  );

  const getOrdenesByCliente = useCallback(
    (clienteId: string) =>
      state.ordenesComerciales.filter((o) => o.clienteId === clienteId),
    [state.ordenesComerciales]
  );

  const getFacturasPendientes = useCallback(
    () =>
      state.ordenesComerciales.filter(
        (o) => o.tipo === 'factura' && o.estado === 'emitida'
      ),
    [state.ordenesComerciales]
  );

  const facturasPendientesCount = useMemo(
    () => getFacturasPendientes().length,
    [getFacturasPendientes]
  );

  const getPagosByOrdenComercialId = useCallback(
    (ordenComercialId: string) =>
      state.pagos.filter((p) => p.ordenComercialId === ordenComercialId && p.monto > 0),
    [state.pagos]
  );

  const getTotalPagado = useCallback(
    (ordenComercialId: string) =>
      getPagosByOrdenComercialId(ordenComercialId).reduce((sum, p) => sum + p.monto, 0),
    [getPagosByOrdenComercialId]
  );

  const getPagosByClienteId = useCallback(
    (clienteId: string) => {
      const ordenIds = state.ordenesComerciales
        .filter((o) => o.clienteId === clienteId)
        .map((o) => o.id);
      return state.pagos.filter(
        (p) => ordenIds.includes(p.ordenComercialId) && p.monto > 0
      );
    },
    [state.ordenesComerciales, state.pagos]
  );

  const createCotizacionFromOrdenTrabajo = useCallback(
    (orden: OrdenTrabajo, getPiezaNombre: (id: string) => string): OrdenComercial => {
      const existing = state.ordenesComerciales.find(
        (o) => o.ordenTrabajoId === orden.id
      );
      if (existing) return existing;

      const lineIdStart =
        state.ordenesComerciales.reduce(
          (max, o) =>
            Math.max(
              max,
              ...o.lineas.map((l) => {
                const n = parseInt(l.id.replace(/\D/g, ''), 10);
                return Number.isNaN(n) ? 0 : n;
              })
            ),
          0
        ) + 1;

      const lineas = buildLineasFromOrdenTrabajo(orden, lineIdStart, getPiezaNombre);
      const subtotal = lineas.reduce((sum, l) => sum + l.subtotal, 0);
      const iva = Math.round(subtotal * 0.21 * 100) / 100;
      const total = Math.round((subtotal + iva) * 100) / 100;

      const cotizacion: OrdenComercial = {
        id: generateOrdenComercialId(state.ordenesComerciales),
        numero: generateCotizacionNumero(state.ordenesComerciales),
        tipo: 'cotizacion',
        estado: 'borrador',
        clienteId: orden.clienteId,
        vehiculoId: orden.vehiculoId,
        ordenTrabajoId: orden.id,
        fecha: MOCK_TODAY,
        validezHasta: addDaysIso(MOCK_TODAY, 30),
        lineas,
        subtotal,
        iva,
        total,
      };

      dispatch({ type: 'ADD_ORDEN', orden: cotizacion });
      return cotizacion;
    },
    [state.ordenesComerciales]
  );

  const updateCotizacionEstado = useCallback(
    (id: string, estado: CotizacionEstado): boolean => {
      const orden = state.ordenesComerciales.find((o) => o.id === id);
      if (!orden || orden.tipo !== 'cotizacion') return false;
      dispatch({ type: 'UPDATE_ORDEN', id, data: { estado } });
      return true;
    },
    [state.ordenesComerciales]
  );

  const updateFacturaEstado = useCallback(
    (id: string, estado: FacturaEstado): boolean => {
      const orden = state.ordenesComerciales.find((o) => o.id === id);
      if (!orden || orden.tipo !== 'factura') return false;
      dispatch({ type: 'UPDATE_ORDEN', id, data: { estado } });
      return true;
    },
    [state.ordenesComerciales]
  );

  const convertCotizacionToFactura = useCallback(
    (cotizacionId: string): OrdenComercial | null => {
      const cotizacion = state.ordenesComerciales.find((o) => o.id === cotizacionId);
      if (!cotizacion || cotizacion.tipo !== 'cotizacion') return null;
      if (cotizacion.estado !== 'aceptada' && cotizacion.estado !== 'enviada') {
        return null;
      }

      const facturas = state.ordenesComerciales.filter((o) => o.tipo === 'factura');
      const factura: OrdenComercial = {
        ...cotizacion,
        id: generateOrdenComercialId(state.ordenesComerciales),
        numero: generateFacturaNumero(facturas),
        tipo: 'factura',
        estado: 'borrador',
        fecha: MOCK_TODAY,
        validezHasta: undefined,
      };

      dispatch({ type: 'ADD_ORDEN', orden: factura });
      dispatch({
        type: 'UPDATE_ORDEN',
        id: cotizacionId,
        data: { estado: 'convertida' },
      });
      return factura;
    },
    [state.ordenesComerciales]
  );

  const registerPago = useCallback(
    (values: PagoFormValues): Pago | null => {
      const orden = state.ordenesComerciales.find((o) => o.id === values.ordenComercialId);
      if (!orden || orden.tipo !== 'factura') return null;
      if (orden.estado !== 'emitida' && orden.estado !== 'pagada') return null;

      const monto = parseFloat(values.monto);
      if (!monto || monto <= 0) return null;

      const pago: Pago = {
        id: generatePagoId(state.pagos),
        ordenComercialId: values.ordenComercialId,
        monto,
        fecha: MOCK_TODAY,
        metodo: values.metodo as PagoMetodo,
        referencia: values.referencia.trim() || undefined,
        notas: values.notas.trim() || undefined,
      };

      dispatch({ type: 'ADD_PAGO', pago });

      const pagado =
        state.pagos
          .filter((p) => p.ordenComercialId === values.ordenComercialId && p.monto > 0)
          .reduce((sum, p) => sum + p.monto, 0) + monto;

      if (pagado >= orden.total - 0.01) {
        dispatch({
          type: 'UPDATE_ORDEN',
          id: values.ordenComercialId,
          data: { estado: 'pagada' },
        });
      }

      return pago;
    },
    [state.ordenesComerciales, state.pagos]
  );

  const value = useMemo(
    () => ({
      ordenesComerciales: state.ordenesComerciales,
      pagos: state.pagos,
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
      state.ordenesComerciales,
      state.pagos,
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
    ]
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
      'useOrdenesComercialesStore debe usarse dentro de OrdenesComercialesProvider'
    );
  }
  return ctx;
}

export const emptyPagoFormValues: PagoFormValues = {
  ordenComercialId: '',
  monto: '',
  metodo: 'transferencia',
  referencia: '',
  notas: '',
};
