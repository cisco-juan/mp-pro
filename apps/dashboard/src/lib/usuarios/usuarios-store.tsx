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
  createRolApi,
  createUsuarioApi,
  fetchRoles,
  fetchUsuarios,
  toggleUsuarioActivoApi,
} from '@/lib/api/usuarios-api';
import type { Rol, RolFormValues, Usuario, UsuarioFormValues } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-store';

export const MECANICO_ROL_ID = 'r2';

export const emptyUsuarioFormValues: UsuarioFormValues = {
  nombre: '',
  email: '',
  telefono: '',
  rolId: '',
  password: '',
};

export const emptyRolFormValues: RolFormValues = {
  nombre: '',
  descripcion: '',
};

export type UsuariosContextValue = {
  usuarios: Usuario[];
  roles: Rol[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getUsuario: (id: string) => Usuario | undefined;
  getRol: (id: string) => Rol | undefined;
  getRolNombre: (rolId: string) => string;
  getUsuariosByRolId: (rolId: string) => Usuario[];
  getUsuariosMecanicos: () => Usuario[];
  createUsuario: (values: UsuarioFormValues) => Promise<Usuario | null>;
  toggleUsuarioActivo: (id: string) => Promise<boolean>;
  createRol: (values: RolFormValues) => Promise<Rol | null>;
};

const UsuariosContext = createContext<UsuariosContextValue | null>(null);

export function UsuariosProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setUsuarios([]);
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        fetchUsuarios(),
        fetchRoles(),
      ]);
      setUsuarios(usersData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getUsuario = useCallback(
    (id: string) => usuarios.find((u) => u.id === id),
    [usuarios],
  );

  const getRol = useCallback(
    (id: string) => roles.find((r) => r.id === id),
    [roles],
  );

  const getRolNombre = useCallback(
    (rolId: string) => roles.find((r) => r.id === rolId)?.nombre ?? 'Sin rol',
    [roles],
  );

  const getUsuariosByRolId = useCallback(
    (rolId: string) => usuarios.filter((u) => u.rolId === rolId),
    [usuarios],
  );

  const getUsuariosMecanicos = useCallback(
    () => usuarios.filter((u) => u.rolId === MECANICO_ROL_ID && u.activo),
    [usuarios],
  );

  const createUsuario = useCallback(
    async (values: UsuarioFormValues): Promise<Usuario | null> => {
      try {
        const usuario = await createUsuarioApi(values);
        setUsuarios((prev) => [...prev, usuario]);
        return usuario;
      } catch {
        return null;
      }
    },
    [],
  );

  const toggleUsuarioActivo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updated = await toggleUsuarioActivoApi(id);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, activo: updated.activo } : u)),
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  const createRol = useCallback(
    async (values: RolFormValues): Promise<Rol | null> => {
      try {
        const rol = await createRolApi(values);
        setRoles((prev) => [...prev, rol]);
        return rol;
      } catch {
        return null;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      usuarios,
      roles,
      loading,
      error,
      reload,
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
      usuarios,
      roles,
      loading,
      error,
      reload,
      getUsuario,
      getRol,
      getRolNombre,
      getUsuariosByRolId,
      getUsuariosMecanicos,
      createUsuario,
      toggleUsuarioActivo,
      createRol,
    ],
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

// Re-export types for components that import from mock-data
export type { Rol, RolFormValues, Usuario, UsuarioFormValues };
