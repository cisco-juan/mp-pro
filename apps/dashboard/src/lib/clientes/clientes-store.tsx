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
  computeUrgencia,
  formValuesToClienteData,
  formValuesToVehiculoData,
  type Cliente,
  type ClienteFormValues,
  type Vehiculo,
  type VehiculoFormValues,
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
  | { type: 'TOGGLE_CLIENTE_ESTADO'; id: string }
  | { type: 'ADD_VEHICULO'; vehiculo: Vehiculo }
  | { type: 'UPDATE_VEHICULO'; id: string; data: Partial<Vehiculo>; previousClienteId?: string }
  | { type: 'TOGGLE_VEHICULO_ESTADO'; id: string }
  | { type: 'SYNC_VEHICULOS_COUNT'; clienteId: string; count: number };

function syncClienteVehiculosCount(
  clientes: Cliente[],
  clienteId: string,
  vehiculos: Vehiculo[]
): Cliente[] {
  const count = vehiculos.filter((v) => v.clienteId === clienteId).length;
  return clientes.map((c) =>
    c.id === clienteId ? { ...c, vehiculosCount: count } : c
  );
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'SET_VEHICULOS':
      return { ...state, vehiculos: action.payload };
    case 'ADD_CLIENTE': {
      let clientes = [...state.clientes, action.cliente];
      let vehiculos = state.vehiculos;
      if (action.vehiculo) {
        vehiculos = [...vehiculos, action.vehiculo];
        clientes = syncClienteVehiculosCount(clientes, action.cliente.id, vehiculos);
      }
      return { clientes, vehiculos };
    }
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.id ? { ...c, ...action.data } : c
        ),
      };
    case 'TOGGLE_CLIENTE_ESTADO':
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.id
            ? { ...c, estado: c.estado === 'activo' ? 'inactivo' : 'activo' }
            : c
        ),
      };
    case 'ADD_VEHICULO': {
      const vehiculos = [...state.vehiculos, action.vehiculo];
      return {
        vehiculos,
        clientes: syncClienteVehiculosCount(state.clientes, action.vehiculo.clienteId, vehiculos),
      };
    }
    case 'UPDATE_VEHICULO': {
      const vehiculos = state.vehiculos.map((v) =>
        v.id === action.id ? { ...v, ...action.data } : v
      );
      let clientes = state.clientes;
      if (action.previousClienteId && action.previousClienteId !== action.data.clienteId) {
        clientes = syncClienteVehiculosCount(clientes, action.previousClienteId, vehiculos);
      }
      if (action.data.clienteId) {
        clientes = syncClienteVehiculosCount(clientes, action.data.clienteId, vehiculos);
      }
      return { clientes, vehiculos };
    }
    case 'TOGGLE_VEHICULO_ESTADO':
      return {
        ...state,
        vehiculos: state.vehiculos.map((v) =>
          v.id === action.id
            ? { ...v, estado: v.estado === 'activo' ? 'inactivo' : 'activo' }
            : v
        ),
      };
    case 'SYNC_VEHICULOS_COUNT':
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.clienteId ? { ...c, vehiculosCount: action.count } : c
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

function buildVehiculoFromClienteForm(
  clienteId: string,
  values: ClienteFormValues,
  existing: Vehiculo[]
): Vehiculo {
  const today = new Date();
  const proximo = new Date(today);
  proximo.setMonth(proximo.getMonth() + 6);
  const proximoMantenimiento = proximo.toISOString().slice(0, 10);

  return {
    id: generateId('v', existing),
    clienteId,
    matricula: values.vehiculoMatricula.trim().toUpperCase(),
    marca: values.vehiculoMarca.trim(),
    modelo: values.vehiculoModelo.trim(),
    anio: parseInt(values.vehiculoAnio, 10) || new Date().getFullYear(),
    color: values.vehiculoColor.trim() || '—',
    kilometraje: parseInt(values.vehiculoKilometraje.replace(/\D/g, ''), 10) || 0,
    proximoMantenimiento,
    urgencia: computeUrgencia(proximoMantenimiento),
    estado: 'activo',
  };
}

function buildVehiculoFromVehiculoForm(
  values: VehiculoFormValues,
  existing: Vehiculo[]
): Vehiculo {
  const data = formValuesToVehiculoData(values);
  return {
    id: generateId('v', existing),
    ...data,
    urgencia: computeUrgencia(data.proximoMantenimiento),
    estado: 'activo',
  };
}

export type ClientesContextValue = {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  getCliente: (id: string) => Cliente | undefined;
  getClienteNombre: (clienteId: string) => string;
  getVehiculo: (id: string) => Vehiculo | undefined;
  getVehiculoLabel: (vehiculoId: string) => string;
  getVehiculosByCliente: (clienteId: string) => Vehiculo[];
  createCliente: (values: ClienteFormValues) => Cliente | null;
  updateCliente: (id: string, values: ClienteFormValues) => boolean;
  toggleClienteEstado: (id: string) => ClienteEstado | null;
  createVehiculo: (values: VehiculoFormValues) => Vehiculo | null;
  updateVehiculo: (id: string, values: VehiculoFormValues) => boolean;
  toggleVehiculoEstado: (id: string) => VehiculoEstado | null;
};

type ClienteEstado = Cliente['estado'];
type VehiculoEstado = Vehiculo['estado'];

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

  const getVehiculo = useCallback(
    (id: string) => state.vehiculos.find((v) => v.id === id),
    [state.vehiculos]
  );

  const getClienteNombre = useCallback(
    (clienteId: string) =>
      state.clientes.find((c) => c.id === clienteId)?.nombre ?? 'Cliente desconocido',
    [state.clientes]
  );

  const getVehiculoLabel = useCallback(
    (vehiculoId: string) => {
      const v = state.vehiculos.find((item) => item.id === vehiculoId);
      return v ? `${v.marca} ${v.modelo} (${v.matricula})` : 'Desconocido';
    },
    [state.vehiculos]
  );

  const getVehiculosByCliente = useCallback(
    (clienteId: string) => state.vehiculos.filter((v) => v.clienteId === clienteId),
    [state.vehiculos]
  );

  const createCliente = useCallback(
    (values: ClienteFormValues): Cliente | null => {
      const data = formValuesToClienteData(values);
      const withVehiculo = values.registrarVehiculo;
      const today = new Date().toISOString().slice(0, 10);

      const cliente: Cliente = {
        id: generateId('c', state.clientes),
        ...data,
        estado: 'activo',
        vehiculosCount: 0,
        ultimaVisita: today,
      };

      const vehiculo = withVehiculo
        ? buildVehiculoFromClienteForm(cliente.id, values, state.vehiculos)
        : undefined;

      if (vehiculo) {
        cliente.vehiculosCount = 1;
      }

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
      dispatch({ type: 'TOGGLE_CLIENTE_ESTADO', id });
      return cliente.estado === 'activo' ? 'inactivo' : 'activo';
    },
    [state.clientes]
  );

  const createVehiculo = useCallback(
    (values: VehiculoFormValues): Vehiculo | null => {
      const matricula = values.matricula.trim().toUpperCase();
      if (state.vehiculos.some((v) => v.matricula.toUpperCase() === matricula)) {
        return null;
      }

      const vehiculo = buildVehiculoFromVehiculoForm(values, state.vehiculos);
      dispatch({ type: 'ADD_VEHICULO', vehiculo });
      return vehiculo;
    },
    [state.vehiculos]
  );

  const updateVehiculo = useCallback(
    (id: string, values: VehiculoFormValues): boolean => {
      const existing = state.vehiculos.find((v) => v.id === id);
      if (!existing) return false;

      const matricula = values.matricula.trim().toUpperCase();
      if (
        state.vehiculos.some(
          (v) => v.id !== id && v.matricula.toUpperCase() === matricula
        )
      ) {
        return false;
      }

      const data = formValuesToVehiculoData(values);
      dispatch({
        type: 'UPDATE_VEHICULO',
        id,
        data: {
          ...data,
          urgencia: computeUrgencia(data.proximoMantenimiento),
        },
        previousClienteId: existing.clienteId,
      });
      return true;
    },
    [state.vehiculos]
  );

  const toggleVehiculoEstado = useCallback(
    (id: string): VehiculoEstado | null => {
      const vehiculo = state.vehiculos.find((v) => v.id === id);
      if (!vehiculo) return null;
      dispatch({ type: 'TOGGLE_VEHICULO_ESTADO', id });
      return vehiculo.estado === 'activo' ? 'inactivo' : 'activo';
    },
    [state.vehiculos]
  );

  const value = useMemo(
    () => ({
      clientes: state.clientes,
      vehiculos: state.vehiculos,
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
      state.clientes,
      state.vehiculos,
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
