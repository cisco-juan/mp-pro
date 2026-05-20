import { apiRequest } from './client';
import type { Rol, RolFormValues, Usuario, UsuarioFormValues } from './types';

export async function fetchUsuarios(): Promise<Usuario[]> {
  return apiRequest<Usuario[]>('/users');
}

export async function fetchRoles(): Promise<Rol[]> {
  return apiRequest<Rol[]>('/roles');
}

export async function createUsuarioApi(
  values: UsuarioFormValues,
): Promise<Usuario> {
  return apiRequest<Usuario>('/users', {
    method: 'POST',
    body: {
      nombre: values.nombre,
      email: values.email,
      telefono: values.telefono || undefined,
      rolId: values.rolId,
      password: values.password ?? 'TempPass123!',
    },
  });
}

export async function updateUsuarioApi(
  id: string,
  values: Partial<UsuarioFormValues>,
): Promise<Usuario> {
  return apiRequest<Usuario>(`/users/${id}`, {
    method: 'PATCH',
    body: {
      nombre: values.nombre || undefined,
      email: values.email || undefined,
      telefono: values.telefono || undefined,
      rolId: values.rolId || undefined,
    },
  });
}

export async function toggleUsuarioActivoApi(id: string): Promise<Usuario> {
  return apiRequest<Usuario>(`/users/${id}/toggle-active`, {
    method: 'PATCH',
  });
}

export async function createRolApi(values: RolFormValues): Promise<Rol> {
  return apiRequest<Rol>('/roles', {
    method: 'POST',
    body: {
      nombre: values.nombre,
      descripcion: values.descripcion,
      permisos: values.permisos ?? ['taller:read'],
    },
  });
}
