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
  createClienteApi,
  createVehiculoApi,
  fetchClientes,
  fetchVehiculos,
  toggleClienteActivoApi,
  toggleVehiculoActivoApi,
  updateClienteApi,
  updateVehiculoApi,
} from '@/lib/api/clientes-api';
import type { Cliente, Vehiculo } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-store';
import type { ClienteFormValues, VehiculoFormValues } from '@/lib/mock-data';

export type ClientesContextValue = {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getCliente: (id: string) => Cliente | undefined;
  getClienteNombre: (clienteId: string) => string;
  getVehiculo: (id: string) => Vehiculo | undefined;
  getVehiculoLabel: (vehiculoId: string) => string;
  getVehiculosByCliente: (clienteId: string) => Vehiculo[];
  createCliente: (values: ClienteFormValues) => Promise<Cliente | null>;
  updateCliente: (id: string, values: ClienteFormValues) => Promise<boolean>;
  toggleClienteEstado: (id: string) => Promise<Cliente['estado'] | null>;
  createVehiculo: (values: VehiculoFormValues) => Promise<Vehiculo | null>;
  updateVehiculo: (id: string, values: VehiculoFormValues) => Promise<boolean>;
  toggleVehiculoEstado: (id: string) => Promise<Vehiculo['estado'] | null>;
};

const ClientesContext = createContext<ClientesContextValue | null>(null);

export function ClientesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setClientes([]);
      setVehiculos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [clientesData, vehiculosData] = await Promise.all([
        fetchClientes(),
        fetchVehiculos(),
      ]);
      setClientes(clientesData);
      setVehiculos(vehiculosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getCliente = useCallback(
    (id: string) => clientes.find((c) => c.id === id),
    [clientes],
  );

  const getVehiculo = useCallback(
    (id: string) => vehiculos.find((v) => v.id === id),
    [vehiculos],
  );

  const getClienteNombre = useCallback(
    (clienteId: string) =>
      clientes.find((c) => c.id === clienteId)?.nombre ?? 'Cliente desconocido',
    [clientes],
  );

  const getVehiculoLabel = useCallback(
    (vehiculoId: string) => {
      const v = vehiculos.find((item) => item.id === vehiculoId);
      return v ? `${v.marca} ${v.modelo} (${v.matricula})` : 'Desconocido';
    },
    [vehiculos],
  );

  const getVehiculosByCliente = useCallback(
    (clienteId: string) => vehiculos.filter((v) => v.clienteId === clienteId),
    [vehiculos],
  );

  const createCliente = useCallback(
    async (values: ClienteFormValues): Promise<Cliente | null> => {
      try {
        const created = await createClienteApi(values);
        setClientes((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        if (values.registrarVehiculo) {
          const vehiculosData = await fetchVehiculos();
          setVehiculos(vehiculosData);
        }
        return created;
      } catch {
        return null;
      }
    },
    [],
  );

  const updateCliente = useCallback(
    async (id: string, values: ClienteFormValues): Promise<boolean> => {
      try {
        const updated = await updateClienteApi(id, values);
        setClientes((prev) =>
          prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.nombre.localeCompare(b.nombre)),
        );
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const toggleClienteEstado = useCallback(
    async (id: string): Promise<Cliente['estado'] | null> => {
      try {
        const updated = await toggleClienteActivoApi(id);
        setClientes((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated.estado;
      } catch {
        return null;
      }
    },
    [],
  );

  const createVehiculo = useCallback(
    async (values: VehiculoFormValues): Promise<Vehiculo | null> => {
      try {
        const created = await createVehiculoApi(values);
        setVehiculos((prev) => [...prev, created]);
        setClientes((prev) =>
          prev.map((c) =>
            c.id === created.clienteId
              ? { ...c, vehiculosCount: c.vehiculosCount + 1 }
              : c,
          ),
        );
        return created;
      } catch {
        return null;
      }
    },
    [],
  );

  const updateVehiculo = useCallback(
    async (id: string, values: VehiculoFormValues): Promise<boolean> => {
      const existing = vehiculos.find((v) => v.id === id);
      if (!existing) return false;

      try {
        const updated = await updateVehiculoApi(id, values);
        setVehiculos((prev) => prev.map((v) => (v.id === id ? updated : v)));

        if (updated.clienteId !== existing.clienteId) {
          setClientes((prev) =>
            prev.map((c) => {
              if (c.id === existing.clienteId) {
                return { ...c, vehiculosCount: Math.max(0, c.vehiculosCount - 1) };
              }
              if (c.id === updated.clienteId) {
                return { ...c, vehiculosCount: c.vehiculosCount + 1 };
              }
              return c;
            }),
          );
        }

        return true;
      } catch {
        return false;
      }
    },
    [vehiculos],
  );

  const toggleVehiculoEstado = useCallback(
    async (id: string): Promise<Vehiculo['estado'] | null> => {
      try {
        const updated = await toggleVehiculoActivoApi(id);
        setVehiculos((prev) => prev.map((v) => (v.id === id ? updated : v)));
        return updated.estado;
      } catch {
        return null;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      clientes,
      vehiculos,
      loading,
      error,
      reload,
      getCliente,
      getClienteNombre,
      getVehiculo,
      getVehiculoLabel,
      getVehiculosByCliente,
      createCliente,
      updateCliente,
      toggleClienteEstado,
      createVehiculo,
      updateVehiculo,
      toggleVehiculoEstado,
    }),
    [
      clientes,
      vehiculos,
      loading,
      error,
      reload,
      getCliente,
      getClienteNombre,
      getVehiculo,
      getVehiculoLabel,
      getVehiculosByCliente,
      createCliente,
      updateCliente,
      toggleClienteEstado,
      createVehiculo,
      updateVehiculo,
      toggleVehiculoEstado,
    ],
  );

  return (
    <ClientesContext.Provider value={value}>{children}</ClientesContext.Provider>
  );
}

export function useClientesStore() {
  const ctx = useContext(ClientesContext);
  if (!ctx) {
    throw new Error('useClientesStore debe usarse dentro de ClientesProvider');
  }
  return ctx;
}

export function formatClienteDireccion(
  direccion: Cliente['direccion'],
): string | null {
  if (!direccion) return null;
  const parts = [
    direccion.linea1,
    direccion.linea2,
    `${direccion.codigoPostal} ${direccion.ciudad}`,
    direccion.provincia,
  ].filter(Boolean);
  return parts.join(', ');
}

export function getClienteIniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
