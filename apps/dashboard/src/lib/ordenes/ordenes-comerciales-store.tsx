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
  getPiezaNombre,
  getPiezaById,
  MOCK_TODAY,
  type OrdenComercial,
  type OrdenTrabajo,
  type LineaOrden,
} from '@/lib/mock-data';

type State = {
  ordenesComerciales: OrdenComercial[];
};

type Action =
  | { type: 'ADD_ORDEN'; orden: OrdenComercial }
  | { type: 'UPDATE_ORDEN'; id: string; data: Partial<OrdenComercial> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ORDEN':
      return { ordenesComerciales: [...state.ordenesComerciales, action.orden] };
    case 'UPDATE_ORDEN':
      return {
        ordenesComerciales: state.ordenesComerciales.map((o) =>
          o.id === action.id ? { ...o, ...action.data } : o
        ),
      };
    default:
      return state;
  }
}

function generateOrdenComercialId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `oc${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `oc${n}`;
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

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildLineasFromOrdenTrabajo(orden: OrdenTrabajo, lineIdStart: number): LineaOrden[] {
  const lineas: LineaOrden[] = [];
  let lineNum = lineIdStart;

  if (orden.descripcion.trim()) {
    const subtotal = 0;
    lineas.push({
      id: `l${lineNum}`,
      tipo: 'servicio',
      referenciaId: 'sv-custom',
      descripcion: orden.descripcion,
      cantidad: 1,
      precioUnitario: subtotal,
      subtotal,
    });
    lineNum += 1;
  }

  for (const pu of orden.piezasUsadas) {
    const pieza = getPiezaById(pu.piezaId);
    const subtotal = pu.cantidad * pu.precioUnitario;
    lineas.push({
      id: `l${lineNum}`,
      tipo: 'pieza',
      referenciaId: pu.piezaId,
      descripcion: pieza?.nombre ?? getPiezaNombre(pu.piezaId),
      cantidad: pu.cantidad,
      precioUnitario: pu.precioUnitario,
      subtotal,
    });
    lineNum += 1;
  }

  return lineas;
}

export type OrdenesComercialesContextValue = {
  ordenesComerciales: OrdenComercial[];
  createCotizacionFromOrdenTrabajo: (orden: OrdenTrabajo) => OrdenComercial;
  getOrdenComercial: (id: string) => OrdenComercial | undefined;
  getOrdenComercialByOrdenTrabajoId: (ordenTrabajoId: string) => OrdenComercial | undefined;
  getOrdenesByCliente: (clienteId: string) => OrdenComercial[];
};

const OrdenesComercialesContext = createContext<OrdenesComercialesContextValue | null>(null);

export function OrdenesComercialesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ordenesComerciales: initialOrdenes,
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

  const createCotizacionFromOrdenTrabajo = useCallback(
    (orden: OrdenTrabajo): OrdenComercial => {
      const existing = state.ordenesComerciales.find(
        (o) => o.ordenTrabajoId === orden.id
      );
      if (existing) return existing;

      const lineIdStart = state.ordenesComerciales.reduce(
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

      const lineas = buildLineasFromOrdenTrabajo(orden, lineIdStart);
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

  const value = useMemo(
    () => ({
      ordenesComerciales: state.ordenesComerciales,
      createCotizacionFromOrdenTrabajo,
      getOrdenComercial,
      getOrdenComercialByOrdenTrabajoId,
      getOrdenesByCliente,
    }),
    [
      state.ordenesComerciales,
      createCotizacionFromOrdenTrabajo,
      getOrdenComercial,
      getOrdenComercialByOrdenTrabajoId,
      getOrdenesByCliente,
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
