export type Rol = {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
};

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rolId: string;
  activo: boolean;
  ordenesActivas: number;
  rol?: Rol;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Usuario;
};

export type UsuarioFormValues = {
  nombre: string;
  email: string;
  telefono: string;
  rolId: string;
  password?: string;
};

export type RolFormValues = {
  nombre: string;
  descripcion: string;
  permisos?: string[];
};
