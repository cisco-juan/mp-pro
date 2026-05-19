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
  citas as initialCitas,
  formValuesToCitaData,
  generateCitaId,
  MOCK_TODAY,
  type Cita,
  type CitaEstado,
  type CitaFormValues,
} from '@/lib/mock-data';

type State = {
  citas: Cita[];
};

type Action =
  | { type: 'ADD_CITA'; cita: Cita }
  | { type: 'UPDATE_CITA'; id: string; data: Partial<Cita> }
  | { type: 'UPDATE_CITA_ESTADO'; id: string; estado: CitaEstado };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_CITA':
      return { citas: [...state.citas, action.cita] };
    case 'UPDATE_CITA':
      return {
        citas: state.citas.map((c) =>
          c.id === action.id ? { ...c, ...action.data } : c
        ),
      };
    case 'UPDATE_CITA_ESTADO':
      return {
        citas: state.citas.map((c) =>
          c.id === action.id ? { ...c, estado: action.estado } : c
        ),
      };
    default:
      return state;
  }
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export type CitasContextValue = {
  citas: Cita[];
  createCita: (values: CitaFormValues) => Cita;
  updateCita: (id: string, values: CitaFormValues) => boolean;
  updateCitaEstado: (id: string, estado: CitaEstado) => boolean;
  getCita: (id: string) => Cita | undefined;
  getCitasByCliente: (clienteId: string) => Cita[];
  getCitasByVehiculo: (vehiculoId: string) => Cita[];
  getCitasHoy: () => Cita[];
  getCitasPorSemana: (weekStart: Date) => Record<string, Cita[]>;
  getCitasCountSemanaActual: () => number;
  getCitasPorDiaChart: (weekStart: Date) => { dia: string; citas: number }[];
};

const CitasContext = createContext<CitasContextValue | null>(null);

export function CitasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { citas: initialCitas });

  const getCita = useCallback(
    (id: string) => state.citas.find((c) => c.id === id),
    [state.citas]
  );

  const getCitasByCliente = useCallback(
    (clienteId: string) =>
      state.citas
        .filter((c) => c.clienteId === clienteId)
        .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`)),
    [state.citas]
  );

  const getCitasByVehiculo = useCallback(
    (vehiculoId: string) =>
      state.citas
        .filter((c) => c.vehiculoId === vehiculoId)
        .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`)),
    [state.citas]
  );

  const getCitasHoy = useCallback(
    () =>
      state.citas
        .filter((c) => c.fecha === MOCK_TODAY)
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [state.citas]
  );

  const getCitasPorSemana = useCallback(
    (weekStart: Date): Record<string, Cita[]> => {
      const monday = getMondayOfWeek(weekStart);
      const result: Record<string, Cita[]> = {};

      for (let i = 0; i < 7; i += 1) {
        const day = addDays(monday, i);
        const iso = toIsoDate(day);
        result[iso] = state.citas
          .filter((c) => c.fecha === iso)
          .sort((a, b) => a.hora.localeCompare(b.hora));
      }

      return result;
    },
    [state.citas]
  );

  const getCitasCountSemanaActual = useCallback(() => {
    const monday = getMondayOfWeek(new Date(MOCK_TODAY));
    const sunday = addDays(monday, 6);
    const mondayIso = toIsoDate(monday);
    const sundayIso = toIsoDate(sunday);
    return state.citas.filter((c) => c.fecha >= mondayIso && c.fecha <= sundayIso).length;
  }, [state.citas]);

  const getCitasPorDiaChart = useCallback(
    (weekStart: Date) => {
      const porSemana = getCitasPorSemana(weekStart);
      const monday = getMondayOfWeek(weekStart);
      const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

      return dayLabels.map((dia, i) => {
        const iso = toIsoDate(addDays(monday, i));
        return { dia, citas: (porSemana[iso] ?? []).length };
      });
    },
    [getCitasPorSemana]
  );

  const createCita = useCallback(
    (values: CitaFormValues): Cita => {
      const data = formValuesToCitaData(values);
      const cita: Cita = {
        id: generateCitaId(state.citas),
        ...data,
        estado: 'pendiente',
      };
      dispatch({ type: 'ADD_CITA', cita });
      return cita;
    },
    [state.citas]
  );

  const updateCita = useCallback(
    (id: string, values: CitaFormValues): boolean => {
      const existing = state.citas.find((c) => c.id === id);
      if (!existing) return false;

      const data = formValuesToCitaData(values);
      dispatch({ type: 'UPDATE_CITA', id, data });
      return true;
    },
    [state.citas]
  );

  const updateCitaEstado = useCallback(
    (id: string, estado: CitaEstado): boolean => {
      const existing = state.citas.find((c) => c.id === id);
      if (!existing) return false;
      dispatch({ type: 'UPDATE_CITA_ESTADO', id, estado });
      return true;
    },
    [state.citas]
  );

  const value = useMemo(
    () => ({
      citas: state.citas,
      createCita,
      updateCita,
      updateCitaEstado,
      getCita,
      getCitasByCliente,
      getCitasByVehiculo,
      getCitasHoy,
      getCitasPorSemana,
      getCitasCountSemanaActual,
      getCitasPorDiaChart,
    }),
    [
      state.citas,
      createCita,
      updateCita,
      updateCitaEstado,
      getCita,
      getCitasByCliente,
      getCitasByVehiculo,
      getCitasHoy,
      getCitasPorSemana,
      getCitasCountSemanaActual,
      getCitasPorDiaChart,
    ]
  );

  return <CitasContext.Provider value={value}>{children}</CitasContext.Provider>;
}

export function useCitasStore() {
  const ctx = useContext(CitasContext);
  if (!ctx) {
    throw new Error('useCitasStore debe usarse dentro de CitasProvider');
  }
  return ctx;
}

export function getDefaultWeekStart(): Date {
  return getMondayOfWeek(new Date(MOCK_TODAY));
}

export function formatSemanaDiaLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const day = labels[date.getDay()];
  return `${day} ${date.getDate()}`;
}
