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

export type ClienteEstado = 'activo' | 'inactivo';
export type VehiculoEstado = 'activo' | 'inactivo';
export type MantenimientoUrgencia = 'ok' | 'proximo' | 'vencido';
export type DocumentoTipo = 'dni' | 'nie' | 'cif' | 'pasaporte';

export type ClienteDireccion = {
  linea1: string;
  linea2?: string;
  ciudad: string;
  codigoPostal: string;
  provincia?: string;
};

export type ClienteDocumento = {
  tipo: DocumentoTipo;
  numero: string;
};

export type Cliente = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  telefonoSecundario?: string;
  empresa?: string;
  direccion?: ClienteDireccion;
  documento?: ClienteDocumento;
  estado: ClienteEstado;
  vehiculosCount: number;
  ultimaVisita: string;
  notas?: string;
};

export type Vehiculo = {
  id: string;
  clienteId: string;
  matricula: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  kilometraje: number;
  proximoMantenimiento: string;
  urgencia: MantenimientoUrgencia;
  estado: VehiculoEstado;
};

export type Pieza = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precioUnitario: number;
  ubicacion?: string;
  estado?: 'activo' | 'inactivo';
};

export type OrdenEstado =
  | 'pendiente'
  | 'en_progreso'
  | 'esperando_piezas'
  | 'completado';

export type OrdenTrabajoTipo = 'mantenimiento' | 'reparacion';

export type PiezaUsada = {
  lineId?: string;
  piezaId: string;
  cantidad: number;
  precioUnitario: number;
};

export type OrdenTrabajo = {
  id: string;
  numero: string;
  tipo: OrdenTrabajoTipo;
  clienteId: string;
  vehiculoId: string;
  usuarioId: string;
  estado: OrdenEstado;
  descripcion: string;
  fechaEntrada: string;
  fechaEstimada: string;
  totalEstimado: number;
  piezasUsadas: PiezaUsada[];
  ordenComercialId?: string;
  checklist: { item: string; completado: boolean }[];
  timeline: { fecha: string; estado: OrdenEstado; nota: string }[];
};
