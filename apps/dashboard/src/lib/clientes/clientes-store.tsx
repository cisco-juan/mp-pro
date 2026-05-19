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
  clientes as initialClientes,
  vehiculos as initialVehiculos,
  formValuesToClienteData,
  type Cliente,
  type ClienteFormValues,
  type Vehiculo,
} from '@/lib/mock-data';

type State = {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
};

type Action =
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'SET_VEHICULOS'; payload: Vehiculo[] }
  | { type: 'ADD_CLIENTE'; cliente: Cliente; vehiculo?: Vehiculo }
  | { type: 'UPDATE_CLIENTE'; id: string; data: Partial<Cliente> }
  | { type: 'TOGGLE_ESTADO'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'SET_VEHICULOS':
      return { ...state, vehiculos: action.payload };
    case 'ADD_CLIENTE':
      return {
        clientes: [...state.clientes, action.cliente],
        vehiculos: action.vehiculo
          ? [...state.vehiculos, action.vehiculo]
          : state.vehiculos,
      };
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.id ? { ...c, ...action.data } : c
        ),
      };
    case 'TOGGLE_ESTADO':
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.id
            ? { ...c, estado: c.estado === 'activo' ? 'inactivo' : 'activo' }
            : c
        ),
      };
    default:
      return state;
  }
}

function generateId(prefix: string, existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `${prefix}${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `${prefix}${n}`;
  }
  return id;
}

function buildVehiculoFromForm(
  clienteId: string,
  values: ClienteFormValues,
  existing: Vehiculo[]
): Vehiculo {
  const today = new Date();
  const proximo = new Date(today);
  proximo.setMonth(proximo.getMonth() + 6);

  return {
    id: generateId('v', existing),
    clienteId,
    matricula: values.vehiculoMatricula.trim().toUpperCase(),
    marca: values.vehiculoMarca.trim(),
    modelo: values.vehiculoModelo.trim(),
    anio: parseInt(values.vehiculoAnio, 10) || new Date().getFullYear(),
    color: values.vehiculoColor.trim() || '—',
    kilometraje: parseInt(values.vehiculoKilometraje.replace(/\D/g, ''), 10) || 0,
    proximoMantenimiento: proximo.toISOString().slice(0, 10),
    urgencia: 'ok',
  };
}

export type ClientesContextValue = {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  getCliente: (id: string) => Cliente | undefined;
  getVehiculosByCliente: (clienteId: string) => Vehiculo[];
  createCliente: (values: ClienteFormValues) => Cliente | null;
  updateCliente: (id: string, values: ClienteFormValues) => boolean;
  toggleClienteEstado: (id: string) => ClienteEstado | null;
};

type ClienteEstado = Cliente['estado'];

const ClientesContext = createContext<ClientesContextValue | null>(null);

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    clientes: initialClientes,
    vehiculos: initialVehiculos,
  });

  const getCliente = useCallback(
    (id: string) => state.clientes.find((c) => c.id === id),
    [state.clientes]
  );

  const getVehiculosByCliente = useCallback(
    (clienteId: string) => state.vehiculos.filter((v) => v.clienteId === clienteId),
    [state.vehiculos]
  );

  const createCliente = useCallback(
    (values: ClienteFormValues): Cliente | null => {
      const data = formValuesToClienteData(values);
      const withVehiculo = values.registrarVehiculo;
      const vehiculosCount = withVehiculo ? 1 : 0;
      const today = new Date().toISOString().slice(0, 10);

      const cliente: Cliente = {
        id: generateId('c', state.clientes),
        ...data,
        estado: 'activo',
        vehiculosCount,
        ultimaVisita: today,
      };

      const vehiculo = withVehiculo
        ? buildVehiculoFromForm(cliente.id, values, state.vehiculos)
        : undefined;

      dispatch({ type: 'ADD_CLIENTE', cliente, vehiculo });
      return cliente;
    },
    [state.clientes, state.vehiculos]
  );

  const updateCliente = useCallback(
    (id: string, values: ClienteFormValues): boolean => {
      const existing = state.clientes.find((c) => c.id === id);
      if (!existing) return false;

      const data = formValuesToClienteData(values);
      dispatch({ type: 'UPDATE_CLIENTE', id, data });
      return true;
    },
    [state.clientes]
  );

  const toggleClienteEstado = useCallback(
    (id: string): ClienteEstado | null => {
      const cliente = state.clientes.find((c) => c.id === id);
      if (!cliente) return null;
      dispatch({ type: 'TOGGLE_ESTADO', id });
      return cliente.estado === 'activo' ? 'inactivo' : 'activo';
    },
    [state.clientes]
  );

  const value = useMemo(
    () => ({
      clientes: state.clientes,
      vehiculos: state.vehiculos,
      getCliente,
      getVehiculosByCliente,
      createCliente,
      updateCliente,
      toggleClienteEstado,
    }),
    [
      state.clientes,
      state.vehiculos,
      getCliente,
      getVehiculosByCliente,
      createCliente,
      updateCliente,
      toggleClienteEstado,
    ]
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
  direccion: Cliente['direccion']
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
