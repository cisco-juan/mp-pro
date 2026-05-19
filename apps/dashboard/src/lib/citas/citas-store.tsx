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
  createCitaApi,
  fetchCitas,
  updateCitaApi,
  updateCitaEstadoApi,
  type Cita,
} from '@/lib/api/citas-api';
import { useAuth } from '@/lib/auth/auth-store';
import type { CitaEstado, CitaFormValues } from '@/lib/mock-data';

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

export function getDefaultWeekStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getMondayOfWeek(today);
}

export function formatSemanaDiaLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${dayNames[d.getDay()]} ${d.getDate()}`;
}

export type CitasContextValue = {
  citas: Cita[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createCita: (values: CitaFormValues) => Promise<Cita | null>;
  updateCita: (id: string, values: CitaFormValues) => Promise<boolean>;
  updateCitaEstado: (id: string, estado: CitaEstado) => Promise<boolean>;
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
  const { isAuthenticated } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setCitas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCitas();
      setCitas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getCita = useCallback((id: string) => citas.find((c) => c.id === id), [citas]);

  const getCitasByCliente = useCallback(
    (clienteId: string) =>
      citas
        .filter((c) => c.clienteId === clienteId)
        .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)),
    [citas],
  );

  const getCitasByVehiculo = useCallback(
    (vehiculoId: string) => citas.filter((c) => c.vehiculoId === vehiculoId),
    [citas],
  );

  const getCitasHoy = useCallback(() => {
    const hoy = toIsoDate(new Date());
    return citas.filter((c) => c.fecha === hoy);
  }, [citas]);

  const getCitasPorSemana = useCallback(
    (weekStart: Date) => {
      const start = getMondayOfWeek(weekStart);
      const end = addDays(start, 6);
      const startIso = toIsoDate(start);
      const endIso = toIsoDate(end);

      const byDay: Record<string, Cita[]> = {};
      for (let i = 0; i < 7; i += 1) {
        byDay[toIsoDate(addDays(start, i))] = [];
      }

      for (const cita of citas) {
        if (cita.fecha >= startIso && cita.fecha <= endIso) {
          byDay[cita.fecha]?.push(cita);
        }
      }

      return byDay;
    },
    [citas],
  );

  const getCitasCountSemanaActual = useCallback(() => {
    const start = getMondayOfWeek(new Date());
    const byDay = getCitasPorSemana(start);
    return Object.values(byDay).reduce((sum, day) => sum + day.length, 0);
  }, [getCitasPorSemana]);

  const getCitasPorDiaChart = useCallback(
    (weekStart: Date) => {
      const byDay = getCitasPorSemana(weekStart);
      const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const start = getMondayOfWeek(weekStart);
      return labels.map((dia, index) => ({
        dia,
        citas: byDay[toIsoDate(addDays(start, index))]?.length ?? 0,
      }));
    },
    [getCitasPorSemana],
  );

  const createCita = useCallback(async (values: CitaFormValues): Promise<Cita | null> => {
    try {
      const cita = await createCitaApi(values);
      setCitas((prev) => [...prev, cita]);
      return cita;
    } catch {
      return null;
    }
  }, []);

  const updateCita = useCallback(
    async (id: string, values: CitaFormValues): Promise<boolean> => {
      try {
        const updated = await updateCitaApi(id, values);
        setCitas((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const updateCitaEstado = useCallback(async (id: string, estado: CitaEstado): Promise<boolean> => {
    try {
      const updated = await updateCitaEstadoApi(id, estado);
      setCitas((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      citas,
      loading,
      error,
      reload,
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
      citas,
      loading,
      error,
      reload,
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
    ],
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
