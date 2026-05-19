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
  servicios as initialServicios,
  type Servicio,
  type ServicioFormValues,
} from '@/lib/mock-data';

type State = {
  servicios: Servicio[];
};

type Action =
  | { type: 'ADD_SERVICIO'; servicio: Servicio }
  | { type: 'UPDATE_SERVICIO'; id: string; data: Partial<Servicio> }
  | { type: 'TOGGLE_SERVICIO'; id: string };

function generateServicioId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `sv${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `sv${n}`;
  }
  return id;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_SERVICIO':
      return { servicios: [...state.servicios, action.servicio] };
    case 'UPDATE_SERVICIO':
      return {
        servicios: state.servicios.map((s) =>
          s.id === action.id ? { ...s, ...action.data } : s
        ),
      };
    case 'TOGGLE_SERVICIO':
      return {
        servicios: state.servicios.map((s) =>
          s.id === action.id ? { ...s, activo: !s.activo } : s
        ),
      };
    default:
      return state;
  }
}

function formValuesToServicioData(values: ServicioFormValues): Omit<Servicio, 'id' | 'activo'> {
  return {
    nombre: values.nombre.trim(),
    descripcion: values.descripcion.trim(),
    precio: parseFloat(values.precio) || 0,
    duracionMin: parseInt(values.duracionMin, 10) || 30,
    categoria: values.categoria.trim(),
  };
}

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
  getServicio: (id: string) => Servicio | undefined;
  getServicioNombre: (id: string) => string;
  createServicio: (values: ServicioFormValues) => Servicio | null;
  updateServicio: (id: string, values: ServicioFormValues) => boolean;
  toggleServicioActivo: (id: string) => boolean;
};

const ServiciosContext = createContext<ServiciosContextValue | null>(null);

export function ServiciosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { servicios: initialServicios });

  const serviciosActivos = useMemo(
    () => state.servicios.filter((s) => s.activo),
    [state.servicios]
  );

  const categorias = useMemo(
    () => [...new Set(state.servicios.map((s) => s.categoria))].sort(),
    [state.servicios]
  );

  const getServicio = useCallback(
    (id: string) => state.servicios.find((s) => s.id === id),
    [state.servicios]
  );

  const getServicioNombre = useCallback(
    (id: string) => state.servicios.find((s) => s.id === id)?.nombre ?? 'Servicio desconocido',
    [state.servicios]
  );

  const createServicio = useCallback(
    (values: ServicioFormValues): Servicio | null => {
      if (!values.nombre.trim() || !values.categoria.trim()) return null;

      const servicio: Servicio = {
        id: generateServicioId(state.servicios),
        ...formValuesToServicioData(values),
        activo: true,
      };
      dispatch({ type: 'ADD_SERVICIO', servicio });
      return servicio;
    },
    [state.servicios]
  );

  const updateServicio = useCallback(
    (id: string, values: ServicioFormValues): boolean => {
      if (!state.servicios.some((s) => s.id === id)) return false;
      if (!values.nombre.trim() || !values.categoria.trim()) return false;

      dispatch({
        type: 'UPDATE_SERVICIO',
        id,
        data: formValuesToServicioData(values),
      });
      return true;
    },
    [state.servicios]
  );

  const toggleServicioActivo = useCallback(
    (id: string): boolean => {
      if (!state.servicios.some((s) => s.id === id)) return false;
      dispatch({ type: 'TOGGLE_SERVICIO', id });
      return true;
    },
    [state.servicios]
  );

  const value = useMemo(
    () => ({
      servicios: state.servicios,
      serviciosActivos,
      categorias,
      getServicio,
      getServicioNombre,
      createServicio,
      updateServicio,
      toggleServicioActivo,
    }),
    [
      state.servicios,
      serviciosActivos,
      categorias,
      getServicio,
      getServicioNombre,
      createServicio,
      updateServicio,
      toggleServicioActivo,
    ]
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
