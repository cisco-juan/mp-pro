export type AuthUser = {
  id: string;
  email: string;
  nombre: string;
  roleId: string;
  permisos: string[];
  activo: boolean;
};
