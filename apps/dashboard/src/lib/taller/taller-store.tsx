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
  ordenesTrabajo as initialOrdenes,
  formValuesToOrdenTrabajoData,
  generateOrdenTrabajoId,
  generateOrdenTrabajoNumero,
  buildTimelineEntry,
  buildChecklistFromTemplate,
  computeTotalPiezas,
  MOCK_TODAY,
  ordenEstadoLabels,
  type OrdenTrabajo,
  type OrdenEstado,
  type OrdenTrabajoFormValues,
  type PiezaUsada,
} from '@/lib/mock-data';

type State = {
  ordenesTrabajo: OrdenTrabajo[];
};

type Action =
  | { type: 'ADD_ORDEN'; orden: OrdenTrabajo }
  | { type: 'UPDATE_ORDEN'; id: string; data: Partial<OrdenTrabajo> }
  | { type: 'UPDATE_ORDEN_ESTADO'; id: string; estado: OrdenEstado; nota: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ORDEN':
      return { ordenesTrabajo: [...state.ordenesTrabajo, action.orden] };
    case 'UPDATE_ORDEN':
      return {
        ordenesTrabajo: state.ordenesTrabajo.map((o) =>
          o.id === action.id ? { ...o, ...action.data } : o
        ),
      };
    case 'UPDATE_ORDEN_ESTADO':
      return {
        ordenesTrabajo: state.ordenesTrabajo.map((o) => {
          if (o.id !== action.id) return o;
          return {
            ...o,
            estado: action.estado,
            timeline: [
              ...o.timeline,
              buildTimelineEntry(action.estado, action.nota),
            ],
          };
        }),
      };
    default:
      return state;
  }
}

export type TallerContextValue = {
  ordenesTrabajo: OrdenTrabajo[];
  createOrdenTrabajo: (values: OrdenTrabajoFormValues) => OrdenTrabajo;
  updateOrdenTrabajo: (id: string, values: OrdenTrabajoFormValues) => boolean;
  updateOrdenEstado: (id: string, estado: OrdenEstado, nota?: string) => boolean;
  toggleChecklistItem: (id: string, index: number) => boolean;
  setPiezasUsadas: (id: string, piezas: PiezaUsada[]) => boolean;
  addPieza: (id: string, pieza: PiezaUsada) => boolean;
  removePieza: (id: string, piezaIndex: number) => boolean;
  assignMecanico: (id: string, usuarioId: string) => boolean;
  linkOrdenComercial: (id: string, ordenComercialId: string) => boolean;
  getOrdenTrabajo: (id: string) => OrdenTrabajo | undefined;
  getOrdenesByCliente: (clienteId: string) => OrdenTrabajo[];
  getOrdenesByVehiculo: (vehiculoId: string) => OrdenTrabajo[];
  getOrdenesAbiertas: () => OrdenTrabajo[];
  getOrdenesAbiertasCount: () => number;
};

const TallerContext = createContext<TallerContextValue | null>(null);

export function TallerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ordenesTrabajo: initialOrdenes,
  });

  const getOrdenTrabajo = useCallback(
    (id: string) => state.ordenesTrabajo.find((o) => o.id === id),
    [state.ordenesTrabajo]
  );

  const getOrdenesByCliente = useCallback(
    (clienteId: string) =>
      state.ordenesTrabajo
        .filter((o) => o.clienteId === clienteId)
        .sort((a, b) => b.fechaEntrada.localeCompare(a.fechaEntrada)),
    [state.ordenesTrabajo]
  );

  const getOrdenesByVehiculo = useCallback(
    (vehiculoId: string) =>
      state.ordenesTrabajo
        .filter((o) => o.vehiculoId === vehiculoId)
        .sort((a, b) => b.fechaEntrada.localeCompare(a.fechaEntrada)),
    [state.ordenesTrabajo]
  );

  const getOrdenesAbiertas = useCallback(
    () => state.ordenesTrabajo.filter((o) => o.estado !== 'completado'),
    [state.ordenesTrabajo]
  );

  const getOrdenesAbiertasCount = useCallback(
    () => state.ordenesTrabajo.filter((o) => o.estado !== 'completado').length,
    [state.ordenesTrabajo]
  );

  const createOrdenTrabajo = useCallback(
    (values: OrdenTrabajoFormValues): OrdenTrabajo => {
      const data = formValuesToOrdenTrabajoData(values);
      const orden: OrdenTrabajo = {
        id: generateOrdenTrabajoId(state.ordenesTrabajo),
        numero: generateOrdenTrabajoNumero(state.ordenesTrabajo),
        ...data,
        estado: 'pendiente',
        totalEstimado: 0,
        piezasUsadas: [],
        checklist: buildChecklistFromTemplate(values.tipo),
        timeline: [buildTimelineEntry('pendiente', 'Orden creada')],
      };
      dispatch({ type: 'ADD_ORDEN', orden });
      return orden;
    },
    [state.ordenesTrabajo]
  );

  const updateOrdenTrabajo = useCallback(
    (id: string, values: OrdenTrabajoFormValues): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing) return false;

      const data = formValuesToOrdenTrabajoData(values);
      const tipoChanged = existing.tipo !== values.tipo;
      dispatch({
        type: 'UPDATE_ORDEN',
        id,
        data: {
          ...data,
          ...(tipoChanged ? { checklist: buildChecklistFromTemplate(values.tipo) } : {}),
        },
      });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const updateOrdenEstado = useCallback(
    (id: string, estado: OrdenEstado, nota?: string): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing || existing.estado === estado) return false;

      const defaultNota = `Estado actualizado a ${ordenEstadoLabels[estado].toLowerCase()}`;
      dispatch({
        type: 'UPDATE_ORDEN_ESTADO',
        id,
        estado,
        nota: nota ?? defaultNota,
      });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const toggleChecklistItem = useCallback(
    (id: string, index: number): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing || index < 0 || index >= existing.checklist.length) return false;

      const checklist = existing.checklist.map((item, i) =>
        i === index ? { ...item, completado: !item.completado } : item
      );
      dispatch({ type: 'UPDATE_ORDEN', id, data: { checklist } });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const setPiezasUsadas = useCallback(
    (id: string, piezas: PiezaUsada[]): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing) return false;

      dispatch({
        type: 'UPDATE_ORDEN',
        id,
        data: {
          piezasUsadas: piezas,
          totalEstimado: computeTotalPiezas(piezas),
        },
      });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const addPieza = useCallback(
    (id: string, pieza: PiezaUsada): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing) return false;

      const piezasUsadas = [...existing.piezasUsadas, pieza];
      dispatch({
        type: 'UPDATE_ORDEN',
        id,
        data: {
          piezasUsadas,
          totalEstimado: computeTotalPiezas(piezasUsadas),
        },
      });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const removePieza = useCallback(
    (id: string, piezaIndex: number): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing || piezaIndex < 0 || piezaIndex >= existing.piezasUsadas.length) {
        return false;
      }

      const piezasUsadas = existing.piezasUsadas.filter((_, i) => i !== piezaIndex);
      dispatch({
        type: 'UPDATE_ORDEN',
        id,
        data: {
          piezasUsadas,
          totalEstimado: computeTotalPiezas(piezasUsadas),
        },
      });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const assignMecanico = useCallback(
    (id: string, usuarioId: string): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing) return false;
      dispatch({ type: 'UPDATE_ORDEN', id, data: { usuarioId } });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const linkOrdenComercial = useCallback(
    (id: string, ordenComercialId: string): boolean => {
      const existing = state.ordenesTrabajo.find((o) => o.id === id);
      if (!existing) return false;
      dispatch({ type: 'UPDATE_ORDEN', id, data: { ordenComercialId } });
      return true;
    },
    [state.ordenesTrabajo]
  );

  const value = useMemo(
    () => ({
      ordenesTrabajo: state.ordenesTrabajo,
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
      state.ordenesTrabajo,
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
    ]
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

export { MOCK_TODAY };
