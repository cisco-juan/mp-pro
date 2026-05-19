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
  roles as initialRoles,
  usuarios as initialUsuarios,
  type Rol,
  type RolFormValues,
  type Usuario,
  type UsuarioFormValues,
} from '@/lib/mock-data';

type State = {
  usuarios: Usuario[];
  roles: Rol[];
};

type Action =
  | { type: 'ADD_USUARIO'; usuario: Usuario }
  | { type: 'UPDATE_USUARIO'; id: string; data: Partial<Usuario> }
  | { type: 'TOGGLE_USUARIO'; id: string }
  | { type: 'ADD_ROL'; rol: Rol };

function generateUsuarioId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `u${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `u${n}`;
  }
  return id;
}

function generateRolId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `r${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `r${n}`;
  }
  return id;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_USUARIO':
      return { ...state, usuarios: [...state.usuarios, action.usuario] };
    case 'UPDATE_USUARIO':
      return {
        ...state,
        usuarios: state.usuarios.map((u) =>
          u.id === action.id ? { ...u, ...action.data } : u
        ),
      };
    case 'TOGGLE_USUARIO':
      return {
        ...state,
        usuarios: state.usuarios.map((u) =>
          u.id === action.id ? { ...u, activo: !u.activo } : u
        ),
      };
    case 'ADD_ROL':
      return { ...state, roles: [...state.roles, action.rol] };
    default:
      return state;
  }
}

export const MECANICO_ROL_ID = 'r2';

export const emptyUsuarioFormValues: UsuarioFormValues = {
  nombre: '',
  email: '',
  telefono: '',
  rolId: '',
};

export const emptyRolFormValues: RolFormValues = {
  nombre: '',
  descripcion: '',
};

export type UsuariosContextValue = {
  usuarios: Usuario[];
  roles: Rol[];
  getUsuario: (id: string) => Usuario | undefined;
  getRol: (id: string) => Rol | undefined;
  getRolNombre: (rolId: string) => string;
  getUsuariosByRolId: (rolId: string) => Usuario[];
  getUsuariosMecanicos: () => Usuario[];
  createUsuario: (values: UsuarioFormValues) => Usuario | null;
  toggleUsuarioActivo: (id: string) => boolean;
  createRol: (values: RolFormValues) => Rol | null;
};

const UsuariosContext = createContext<UsuariosContextValue | null>(null);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    usuarios: initialUsuarios,
    roles: initialRoles,
  });

  const getUsuario = useCallback(
    (id: string) => state.usuarios.find((u) => u.id === id),
    [state.usuarios]
  );

  const getRol = useCallback(
    (id: string) => state.roles.find((r) => r.id === id),
    [state.roles]
  );

  const getRolNombre = useCallback(
    (rolId: string) => state.roles.find((r) => r.id === rolId)?.nombre ?? 'Sin rol',
    [state.roles]
  );

  const getUsuariosByRolId = useCallback(
    (rolId: string) => state.usuarios.filter((u) => u.rolId === rolId),
    [state.usuarios]
  );

  const getUsuariosMecanicos = useCallback(
    () =>
      state.usuarios.filter((u) => u.rolId === MECANICO_ROL_ID && u.activo),
    [state.usuarios]
  );

  const createUsuario = useCallback(
    (values: UsuarioFormValues): Usuario | null => {
      const email = values.email.trim().toLowerCase();
      if (!values.nombre.trim() || !email || !values.rolId) return null;
      if (state.usuarios.some((u) => u.email.toLowerCase() === email)) return null;

      const usuario: Usuario = {
        id: generateUsuarioId(state.usuarios),
        nombre: values.nombre.trim(),
        email,
        telefono: values.telefono.trim() || '+34 600 000 000',
        rolId: values.rolId,
        activo: true,
        ordenesActivas: 0,
      };
      dispatch({ type: 'ADD_USUARIO', usuario });
      return usuario;
    },
    [state.usuarios]
  );

  const toggleUsuarioActivo = useCallback(
    (id: string): boolean => {
      if (!state.usuarios.some((u) => u.id === id)) return false;
      dispatch({ type: 'TOGGLE_USUARIO', id });
      return true;
    },
    [state.usuarios]
  );

  const createRol = useCallback(
    (values: RolFormValues): Rol | null => {
      if (!values.nombre.trim()) return null;

      const rol: Rol = {
        id: generateRolId(state.roles),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || 'Rol personalizado',
        permisos: ['taller:read'],
      };
      dispatch({ type: 'ADD_ROL', rol });
      return rol;
    },
    [state.roles]
  );

  const value = useMemo(
    () => ({
      usuarios: state.usuarios,
      roles: state.roles,
      getUsuario,
      getRol,
      getRolNombre,
      getUsuariosByRolId,
      getUsuariosMecanicos,
      createUsuario,
      toggleUsuarioActivo,
      createRol,
    }),
    [
      state.usuarios,
      state.roles,
      getUsuario,
      getRol,
      getRolNombre,
      getUsuariosByRolId,
      getUsuariosMecanicos,
      createUsuario,
      toggleUsuarioActivo,
      createRol,
    ]
  );

  return (
    <UsuariosContext.Provider value={value}>{children}</UsuariosContext.Provider>
  );
}

export function useUsuariosStore() {
  const ctx = useContext(UsuariosContext);
  if (!ctx) {
    throw new Error('useUsuariosStore debe usarse dentro de UsuariosProvider');
  }
  return ctx;
}
