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
  piezas as initialPiezas,
  type Pieza,
  type PiezaFormValues,
} from '@/lib/mock-data';

type State = {
  piezas: Pieza[];
};

type Action =
  | { type: 'ADD_PIEZA'; pieza: Pieza }
  | { type: 'UPDATE_PIEZA'; id: string; data: Partial<Pieza> }
  | { type: 'ADJUST_STOCK'; id: string; delta: number };

function generatePiezaId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `p${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `p${n}`;
  }
  return id;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_PIEZA':
      return { piezas: [...state.piezas, action.pieza] };
    case 'UPDATE_PIEZA':
      return {
        piezas: state.piezas.map((p) =>
          p.id === action.id ? { ...p, ...action.data } : p
        ),
      };
    case 'ADJUST_STOCK':
      return {
        piezas: state.piezas.map((p) =>
          p.id === action.id
            ? { ...p, stock: Math.max(0, p.stock + action.delta) }
            : p
        ),
      };
    default:
      return state;
  }
}

function formValuesToPiezaData(values: PiezaFormValues): Omit<Pieza, 'id'> {
  return {
    codigo: values.codigo.trim().toUpperCase(),
    nombre: values.nombre.trim(),
    categoria: values.categoria.trim(),
    stock: parseInt(values.stock, 10) || 0,
    stockMinimo: parseInt(values.stockMinimo, 10) || 0,
    precioUnitario: parseFloat(values.precioUnitario) || 0,
    ubicacion: values.ubicacion.trim() || undefined,
  };
}

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
  getPieza: (id: string) => Pieza | undefined;
  getPiezaNombre: (id: string) => string;
  createPieza: (values: PiezaFormValues) => Pieza | null;
  updatePieza: (id: string, values: PiezaFormValues) => boolean;
  adjustStock: (id: string, delta: number) => boolean;
  reservarStock: (id: string, cantidad: number) => boolean;
};

const InventarioContext = createContext<InventarioContextValue | null>(null);

export function InventarioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { piezas: initialPiezas });

  const categorias = useMemo(
    () => [...new Set(state.piezas.map((p) => p.categoria))].sort(),
    [state.piezas]
  );

  const stockBajoCount = useMemo(
    () => state.piezas.filter((p) => p.stock <= p.stockMinimo).length,
    [state.piezas]
  );

  const getPieza = useCallback(
    (id: string) => state.piezas.find((p) => p.id === id),
    [state.piezas]
  );

  const getPiezaNombre = useCallback(
    (id: string) => state.piezas.find((p) => p.id === id)?.nombre ?? 'Pieza desconocida',
    [state.piezas]
  );

  const createPieza = useCallback(
    (values: PiezaFormValues): Pieza | null => {
      const codigo = values.codigo.trim().toUpperCase();
      if (!codigo || !values.nombre.trim() || !values.categoria.trim()) {
        return null;
      }
      if (state.piezas.some((p) => p.codigo.toUpperCase() === codigo)) {
        return null;
      }

      const pieza: Pieza = {
        id: generatePiezaId(state.piezas),
        ...formValuesToPiezaData(values),
      };
      dispatch({ type: 'ADD_PIEZA', pieza });
      return pieza;
    },
    [state.piezas]
  );

  const updatePieza = useCallback(
    (id: string, values: PiezaFormValues): boolean => {
      const existing = state.piezas.find((p) => p.id === id);
      if (!existing) return false;

      const codigo = values.codigo.trim().toUpperCase();
      if (
        state.piezas.some((p) => p.id !== id && p.codigo.toUpperCase() === codigo)
      ) {
        return false;
      }

      dispatch({ type: 'UPDATE_PIEZA', id, data: formValuesToPiezaData(values) });
      return true;
    },
    [state.piezas]
  );

  const adjustStock = useCallback(
    (id: string, delta: number): boolean => {
      if (!state.piezas.some((p) => p.id === id)) return false;
      dispatch({ type: 'ADJUST_STOCK', id, delta });
      return true;
    },
    [state.piezas]
  );

  const reservarStock = useCallback(
    (id: string, cantidad: number): boolean => {
      const pieza = state.piezas.find((p) => p.id === id);
      if (!pieza || cantidad < 1 || pieza.stock < cantidad) return false;
      dispatch({ type: 'ADJUST_STOCK', id, delta: -cantidad });
      return true;
    },
    [state.piezas]
  );

  const value = useMemo(
    () => ({
      piezas: state.piezas,
      categorias,
      stockBajoCount,
      getPieza,
      getPiezaNombre,
      createPieza,
      updatePieza,
      adjustStock,
      reservarStock,
    }),
    [
      state.piezas,
      categorias,
      stockBajoCount,
      getPieza,
      getPiezaNombre,
      createPieza,
      updatePieza,
      adjustStock,
      reservarStock,
    ]
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
