import type { Role, User } from '@org/database';

export type UserResponse = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rolId: string;
  activo: boolean;
  ordenesActivas: number;
  rol?: {
    id: string;
    nombre: string;
    descripcion: string;
    permisos: string[];
  };
};

export function mapUserToResponse(
  user: User & { role?: Role },
): UserResponse {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono ?? '',
    rolId: user.roleId,
    activo: user.activo,
    ordenesActivas: user.ordenesActivas,
    ...(user.role
      ? {
          rol: {
            id: user.role.id,
            nombre: user.role.nombre,
            descripcion: user.role.descripcion,
            permisos: user.role.permisos,
          },
        }
      : {}),
  };
}

export type RoleResponse = {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
};

export function mapRoleToResponse(role: Role): RoleResponse {
  return {
    id: role.id,
    nombre: role.nombre,
    descripcion: role.descripcion,
    permisos: role.permisos,
  };
}
