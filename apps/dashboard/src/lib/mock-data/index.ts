export type ClienteEstado = 'activo' | 'inactivo';
export type CitaEstado = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
export type OrdenEstado =
  | 'pendiente'
  | 'en_progreso'
  | 'esperando_piezas'
  | 'completado';
export type OrdenTrabajoTipo = 'mantenimiento' | 'reparacion';
export type MantenimientoUrgencia = 'ok' | 'proximo' | 'vencido';
export type VehiculoEstado = 'activo' | 'inactivo';
export type GarantiaEstado = 'vigente' | 'vencida' | 'anulada';
export type OrdenComercialTipo = 'cotizacion' | 'factura';
export type CotizacionEstado = 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'convertida';
export type FacturaEstado = 'borrador' | 'emitida' | 'pagada' | 'vencida' | 'anulada';
export type OrdenComercialEstado = CotizacionEstado | FacturaEstado;
export type LineaOrdenTipo = 'servicio' | 'pieza';
export type PagoMetodo = 'efectivo' | 'tarjeta' | 'transferencia';
export type DocumentoTipo = 'dni' | 'nie' | 'cif' | 'pasaporte';

export interface ClienteDireccion {
  linea1: string;
  linea2?: string;
  ciudad: string;
  codigoPostal: string;
  provincia?: string;
}

export interface ClienteDocumento {
  tipo: DocumentoTipo;
  numero: string;
}

export interface Cliente {
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
}

export interface ClienteFormValues {
  nombre: string;
  email: string;
  telefono: string;
  telefonoSecundario: string;
  empresa: string;
  notas: string;
  documentoTipo: DocumentoTipo | '';
  documentoNumero: string;
  direccionLinea1: string;
  direccionLinea2: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  registrarVehiculo: boolean;
  vehiculoMatricula: string;
  vehiculoMarca: string;
  vehiculoModelo: string;
  vehiculoAnio: string;
  vehiculoColor: string;
  vehiculoKilometraje: string;
}

export const emptyClienteFormValues: ClienteFormValues = {
  nombre: '',
  email: '',
  telefono: '',
  telefonoSecundario: '',
  empresa: '',
  notas: '',
  documentoTipo: '',
  documentoNumero: '',
  direccionLinea1: '',
  direccionLinea2: '',
  ciudad: '',
  codigoPostal: '',
  provincia: '',
  registrarVehiculo: false,
  vehiculoMatricula: '',
  vehiculoMarca: '',
  vehiculoModelo: '',
  vehiculoAnio: '',
  vehiculoColor: '',
  vehiculoKilometraje: '',
};

export function clienteToFormValues(cliente: Cliente): ClienteFormValues {
  return {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    telefonoSecundario: cliente.telefonoSecundario ?? '',
    empresa: cliente.empresa ?? '',
    notas: cliente.notas ?? '',
    documentoTipo: cliente.documento?.tipo ?? '',
    documentoNumero: cliente.documento?.numero ?? '',
    direccionLinea1: cliente.direccion?.linea1 ?? '',
    direccionLinea2: cliente.direccion?.linea2 ?? '',
    ciudad: cliente.direccion?.ciudad ?? '',
    codigoPostal: cliente.direccion?.codigoPostal ?? '',
    provincia: cliente.direccion?.provincia ?? '',
    registrarVehiculo: false,
    vehiculoMatricula: '',
    vehiculoMarca: '',
    vehiculoModelo: '',
    vehiculoAnio: '',
    vehiculoColor: '',
    vehiculoKilometraje: '',
  };
}

export function formValuesToClienteData(
  values: ClienteFormValues
): Omit<Cliente, 'id' | 'estado' | 'vehiculosCount' | 'ultimaVisita'> {
  const direccion =
    values.direccionLinea1.trim() && values.ciudad.trim() && values.codigoPostal.trim()
      ? {
          linea1: values.direccionLinea1.trim(),
          linea2: values.direccionLinea2.trim() || undefined,
          ciudad: values.ciudad.trim(),
          codigoPostal: values.codigoPostal.trim(),
          provincia: values.provincia.trim() || undefined,
        }
      : undefined;

  const documento =
    values.documentoTipo && values.documentoNumero.trim()
      ? {
          tipo: values.documentoTipo as DocumentoTipo,
          numero: values.documentoNumero.trim(),
        }
      : undefined;

  return {
    nombre: values.nombre.trim(),
    email: values.email.trim(),
    telefono: values.telefono.trim(),
    telefonoSecundario: values.telefonoSecundario.trim() || undefined,
    empresa: values.empresa.trim() || undefined,
    direccion,
    documento,
    notas: values.notas.trim() || undefined,
  };
}

export const documentoTipoLabels: Record<DocumentoTipo, string> = {
  dni: 'DNI',
  nie: 'NIE',
  cif: 'CIF',
  pasaporte: 'Pasaporte',
};

export interface Vehiculo {
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
}

export interface VehiculoFormValues {
  clienteId: string;
  matricula: string;
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  kilometraje: string;
  proximoMantenimiento: string;
}

export const emptyVehiculoFormValues: VehiculoFormValues = {
  clienteId: '',
  matricula: '',
  marca: '',
  modelo: '',
  anio: '',
  color: '',
  kilometraje: '',
  proximoMantenimiento: '',
};

export function vehiculoToFormValues(vehiculo: Vehiculo): VehiculoFormValues {
  return {
    clienteId: vehiculo.clienteId,
    matricula: vehiculo.matricula,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    anio: String(vehiculo.anio),
    color: vehiculo.color,
    kilometraje: String(vehiculo.kilometraje),
    proximoMantenimiento: vehiculo.proximoMantenimiento,
  };
}

export function formValuesToVehiculoData(
  values: VehiculoFormValues
): Omit<Vehiculo, 'id' | 'urgencia' | 'estado'> {
  return {
    clienteId: values.clienteId,
    matricula: values.matricula.trim().toUpperCase(),
    marca: values.marca.trim(),
    modelo: values.modelo.trim(),
    anio: parseInt(values.anio, 10) || new Date().getFullYear(),
    color: values.color.trim() || '—',
    kilometraje: parseInt(values.kilometraje.replace(/\D/g, ''), 10) || 0,
    proximoMantenimiento: values.proximoMantenimiento,
  };
}

export function computeUrgencia(proximoMantenimiento: string): MantenimientoUrgencia {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(proximoMantenimiento + 'T00:00:00');
  const diffMs = fecha.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDias < 0) return 'vencido';
  if (diffDias <= 30) return 'proximo';
  return 'ok';
}

export interface Garantia {
  id: string;
  vehiculoId: string;
  concepto: string;
  proveedor?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: GarantiaEstado;
  notas?: string;
}

export interface PiezaUsadaVehiculo {
  piezaId: string;
  piezaNombre: string;
  cantidad: number;
  precioUnitario: number;
  ordenTrabajoId: string;
  ordenNumero: string;
  fechaEntrada: string;
}

export interface Cita {
  id: string;
  clienteId: string;
  vehiculoId: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  servicioId: string;
  estado: CitaEstado;
  notas?: string;
}

export interface CitaFormValues {
  clienteId: string;
  vehiculoId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  notas: string;
}

export const emptyCitaFormValues: CitaFormValues = {
  clienteId: '',
  vehiculoId: '',
  servicioId: '',
  fecha: '',
  hora: '',
  duracionMin: 60,
  notas: '',
};

export const MOCK_TODAY = '2026-05-19';

export const citaDuracionOpciones = [30, 45, 60, 90, 120] as const;

export function citaToFormValues(cita: Cita): CitaFormValues {
  return {
    clienteId: cita.clienteId,
    vehiculoId: cita.vehiculoId,
    servicioId: cita.servicioId,
    fecha: cita.fecha,
    hora: cita.hora,
    duracionMin: cita.duracionMin,
    notas: cita.notas ?? '',
  };
}

export function formValuesToCitaData(
  values: CitaFormValues
): Omit<Cita, 'id' | 'estado'> {
  return {
    clienteId: values.clienteId,
    vehiculoId: values.vehiculoId,
    servicioId: values.servicioId,
    fecha: values.fecha,
    hora: values.hora,
    duracionMin: values.duracionMin,
    notas: values.notas.trim() || undefined,
  };
}

export function generateCitaId(existing: { id: string }[]): string {
  let n = existing.length + 1;
  let id = `ci${n}`;
  while (existing.some((item) => item.id === id)) {
    n += 1;
    id = `ci${n}`;
  }
  return id;
}

export interface PiezaUsada {
  piezaId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenTrabajo {
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
}

export interface Pieza {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precioUnitario: number;
  ubicacion?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  categoria: string;
  activo: boolean;
}

export interface LineaOrden {
  id: string;
  tipo: LineaOrdenTipo;
  referenciaId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrdenComercial {
  id: string;
  numero: string;
  tipo: OrdenComercialTipo;
  estado: OrdenComercialEstado;
  clienteId: string;
  vehiculoId?: string;
  ordenTrabajoId?: string;
  fecha: string;
  validezHasta?: string;
  lineas: LineaOrden[];
  subtotal: number;
  iva: number;
  total: number;
}

export interface Pago {
  id: string;
  ordenComercialId: string;
  monto: number;
  fecha: string;
  metodo: PagoMetodo;
  referencia?: string;
  notas?: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rolId: string;
  activo: boolean;
  ordenesActivas: number;
}

export interface ActividadReciente {
  id: string;
  tipo: 'cita' | 'orden' | 'cliente' | 'pago';
  titulo: string;
  descripcion: string;
  fecha: string;
}

export const roles: Rol[] = [
  {
    id: 'r1',
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    permisos: ['taller:write', 'ordenes:write', 'pagos:write', 'usuarios:write', 'inventario:write'],
  },
  {
    id: 'r2',
    nombre: 'Mecánico',
    descripcion: 'Gestión de órdenes de trabajo y taller',
    permisos: ['taller:write', 'inventario:read', 'servicios:read'],
  },
  {
    id: 'r3',
    nombre: 'Recepcionista',
    descripcion: 'Citas, clientes y cotizaciones',
    permisos: ['citas:write', 'clientes:write', 'ordenes:write', 'pagos:read'],
  },
  {
    id: 'r4',
    nombre: 'Administración',
    descripcion: 'Facturación y pagos',
    permisos: ['ordenes:write', 'pagos:write', 'clientes:read'],
  },
];

export const usuarios: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Roberto Díaz',
    email: 'roberto.diaz@mppro.local',
    telefono: '+34 600 111 222',
    rolId: 'r2',
    activo: true,
    ordenesActivas: 2,
  },
  {
    id: 'u2',
    nombre: 'Elena Vargas',
    email: 'elena.vargas@mppro.local',
    telefono: '+34 600 222 333',
    rolId: 'r2',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 'u3',
    nombre: 'David Molina',
    email: 'david.molina@mppro.local',
    telefono: '+34 600 333 444',
    rolId: 'r2',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 'u4',
    nombre: 'Sofía Herrera',
    email: 'sofia.herrera@mppro.local',
    telefono: '+34 600 444 555',
    rolId: 'r2',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 'u5',
    nombre: 'Antonio Reyes',
    email: 'antonio.reyes@mppro.local',
    telefono: '+34 600 555 666',
    rolId: 'r3',
    activo: true,
    ordenesActivas: 0,
  },
  {
    id: 'u6',
    nombre: 'Carmen López',
    email: 'carmen.lopez@mppro.local',
    telefono: '+34 600 666 777',
    rolId: 'r4',
    activo: true,
    ordenesActivas: 0,
  },
  {
    id: 'u7',
    nombre: 'Francisco Núñez',
    email: 'francisco.nunez@mppro.local',
    telefono: '+34 600 777 888',
    rolId: 'r2',
    activo: false,
    ordenesActivas: 0,
  },
  {
    id: 'u8',
    nombre: 'Admin MP Pro',
    email: 'admin@mppro.local',
    telefono: '+34 600 000 001',
    rolId: 'r1',
    activo: true,
    ordenesActivas: 0,
  },
];

export const servicios: Servicio[] = [
  {
    id: 'sv1',
    nombre: 'Cambio aceite y filtros',
    descripcion: 'Aceite sintético 5W30 y filtros de aceite y aire',
    precio: 89.0,
    duracionMin: 60,
    categoria: 'Mantenimiento',
    activo: true,
  },
  {
    id: 'sv2',
    nombre: 'Revisión frenos',
    descripcion: 'Inspección pastillas, discos y líquido de frenos',
    precio: 45.0,
    duracionMin: 45,
    categoria: 'Frenos',
    activo: true,
  },
  {
    id: 'sv3',
    nombre: 'Diagnóstico motor',
    descripcion: 'Lectura OBD y diagnóstico completo del motor',
    precio: 65.0,
    duracionMin: 90,
    categoria: 'Motor',
    activo: true,
  },
  {
    id: 'sv4',
    nombre: 'ITV pre-revisión',
    descripcion: 'Comprobación previa a la inspección técnica',
    precio: 35.0,
    duracionMin: 60,
    categoria: 'Inspección',
    activo: true,
  },
  {
    id: 'sv5',
    nombre: 'Rotación neumáticos',
    descripcion: 'Rotación y equilibrado de neumáticos',
    precio: 40.0,
    duracionMin: 45,
    categoria: 'Neumáticos',
    activo: true,
  },
  {
    id: 'sv6',
    nombre: 'Mantenimiento 80.000 km',
    descripcion: 'Servicio completo según plan del fabricante',
    precio: 320.0,
    duracionMin: 180,
    categoria: 'Mantenimiento',
    activo: true,
  },
  {
    id: 'sv7',
    nombre: 'Aire acondicionado',
    descripcion: 'Recarga y revisión del sistema de climatización',
    precio: 75.0,
    duracionMin: 60,
    categoria: 'Climatización',
    activo: true,
  },
  {
    id: 'sv8',
    nombre: 'Reparación suspensión',
    descripcion: 'Sustitución amortiguadores y silentblocks',
    precio: 280.0,
    duracionMin: 120,
    categoria: 'Suspensión',
    activo: false,
  },
];

export const piezas: Pieza[] = [
  {
    id: 'p1',
    codigo: 'FLT-OIL-001',
    nombre: 'Filtro de aceite',
    categoria: 'Filtros',
    stock: 24,
    stockMinimo: 10,
    precioUnitario: 12.5,
    ubicacion: 'A-01',
  },
  {
    id: 'p2',
    codigo: 'FLT-AIR-002',
    nombre: 'Filtro de aire',
    categoria: 'Filtros',
    stock: 18,
    stockMinimo: 8,
    precioUnitario: 18.0,
    ubicacion: 'A-02',
  },
  {
    id: 'p3',
    codigo: 'BRK-PAD-F',
    nombre: 'Pastillas freno delanteras',
    categoria: 'Frenos',
    stock: 6,
    stockMinimo: 4,
    precioUnitario: 45.0,
    ubicacion: 'B-03',
  },
  {
    id: 'p4',
    codigo: 'BRK-DISC-F',
    nombre: 'Discos freno delanteros (par)',
    categoria: 'Frenos',
    stock: 4,
    stockMinimo: 2,
    precioUnitario: 89.0,
    ubicacion: 'B-04',
  },
  {
    id: 'p5',
    codigo: 'OIL-5W30-5L',
    nombre: 'Aceite 5W30 5L',
    categoria: 'Lubricantes',
    stock: 15,
    stockMinimo: 6,
    precioUnitario: 32.0,
    ubicacion: 'C-01',
  },
  {
    id: 'p6',
    codigo: 'BAT-12V-74AH',
    nombre: 'Batería 12V 74Ah',
    categoria: 'Eléctrico',
    stock: 3,
    stockMinimo: 2,
    precioUnitario: 125.0,
    ubicacion: 'D-01',
  },
  {
    id: 'p7',
    codigo: 'TUR-OEM-001',
    nombre: 'Turbocompresor OEM',
    categoria: 'Motor',
    stock: 0,
    stockMinimo: 1,
    precioUnitario: 890.0,
    ubicacion: 'E-02',
  },
  {
    id: 'p8',
    codigo: 'KIT-DIST-001',
    nombre: 'Kit distribución completo',
    categoria: 'Motor',
    stock: 2,
    stockMinimo: 2,
    precioUnitario: 245.0,
    ubicacion: 'E-01',
  },
  {
    id: 'p9',
    codigo: 'SPK-PLG-004',
    nombre: 'Bujías (juego 4)',
    categoria: 'Motor',
    stock: 8,
    stockMinimo: 4,
    precioUnitario: 28.0,
    ubicacion: 'E-03',
  },
  {
    id: 'p10',
    codigo: 'MED-UNIT-001',
    nombre: 'Unidad multimedia Android',
    categoria: 'Accesorios',
    stock: 5,
    stockMinimo: 2,
    precioUnitario: 199.0,
    ubicacion: 'F-01',
  },
];

export const clientes: Cliente[] = [
  {
    id: 'c1',
    nombre: 'María García López',
    email: 'maria.garcia@email.com',
    telefono: '+34 612 345 678',
    telefonoSecundario: '+34 912 345 678',
    empresa: 'Transportes García',
    direccion: {
      linea1: 'Polígono Industrial Norte, 12',
      ciudad: 'Madrid',
      codigoPostal: '28050',
      provincia: 'Madrid',
    },
    documento: { tipo: 'cif', numero: 'B12345678' },
    estado: 'activo',
    vehiculosCount: 3,
    ultimaVisita: '2026-05-15',
    notas: 'Cliente preferente, facturación mensual.',
  },
  {
    id: 'c2',
    nombre: 'Carlos Ruiz Martín',
    email: 'carlos.ruiz@email.com',
    telefono: '+34 623 456 789',
    direccion: {
      linea1: 'Calle Mayor 45, 3ºB',
      ciudad: 'Alcalá de Henares',
      codigoPostal: '28801',
      provincia: 'Madrid',
    },
    documento: { tipo: 'dni', numero: '12345678A' },
    estado: 'activo',
    vehiculosCount: 1,
    ultimaVisita: '2026-05-10',
  },
  {
    id: 'c3',
    nombre: 'Ana Fernández Soto',
    email: 'ana.fernandez@email.com',
    telefono: '+34 634 567 890',
    telefonoSecundario: '+34 916 567 890',
    empresa: 'Fernández Logistics',
    direccion: {
      linea1: 'Av. de la Industria 200',
      linea2: 'Nave 4',
      ciudad: 'Getafe',
      codigoPostal: '28903',
      provincia: 'Madrid',
    },
    documento: { tipo: 'cif', numero: 'B87654321' },
    estado: 'activo',
    vehiculosCount: 5,
    ultimaVisita: '2026-05-18',
  },
  {
    id: 'c4',
    nombre: 'Pedro Jiménez Vega',
    email: 'pedro.jimenez@email.com',
    telefono: '+34 645 678 901',
    documento: { tipo: 'dni', numero: '87654321B' },
    estado: 'inactivo',
    vehiculosCount: 2,
    ultimaVisita: '2026-01-20',
  },
  {
    id: 'c5',
    nombre: 'Laura Méndez Costa',
    email: 'laura.mendez@email.com',
    telefono: '+34 656 789 012',
    telefonoSecundario: '+34 600 111 222',
    direccion: {
      linea1: 'Plaza España 8',
      ciudad: 'Leganés',
      codigoPostal: '28911',
    },
    documento: { tipo: 'nie', numero: 'X1234567L' },
    estado: 'activo',
    vehiculosCount: 1,
    ultimaVisita: '2026-05-12',
  },
  {
    id: 'c6',
    nombre: 'Javier Ortega Pino',
    email: 'javier.ortega@email.com',
    telefono: '+34 667 890 123',
    empresa: 'Ortega Motors',
    direccion: {
      linea1: 'Ctra. de Toledo km 12',
      ciudad: 'Móstoles',
      codigoPostal: '28935',
      provincia: 'Madrid',
    },
    documento: { tipo: 'cif', numero: 'B11223344' },
    estado: 'activo',
    vehiculosCount: 4,
    ultimaVisita: '2026-05-17',
  },
  {
    id: 'c7',
    nombre: 'Isabel Torres Ríos',
    email: 'isabel.torres@email.com',
    telefono: '+34 678 901 234',
    direccion: {
      linea1: 'Calle del Sol 22',
      ciudad: 'Fuenlabrada',
      codigoPostal: '28944',
    },
    documento: { tipo: 'dni', numero: '99887766C' },
    estado: 'activo',
    vehiculosCount: 2,
    ultimaVisita: '2026-05-08',
  },
  {
    id: 'c8',
    nombre: 'Miguel Santos León',
    email: 'miguel.santos@email.com',
    telefono: '+34 689 012 345',
    estado: 'inactivo',
    vehiculosCount: 1,
    ultimaVisita: '2025-11-30',
  },
];

export const vehiculos: Vehiculo[] = [
  {
    id: 'v1',
    clienteId: 'c1',
    matricula: '1234 ABC',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter',
    anio: 2022,
    color: 'Blanco',
    kilometraje: 85400,
    proximoMantenimiento: '2026-06-01',
    urgencia: 'proximo',
    estado: 'activo',
  },
  {
    id: 'v2',
    clienteId: 'c1',
    matricula: '5678 DEF',
    marca: 'Ford',
    modelo: 'Transit',
    anio: 2021,
    color: 'Gris',
    kilometraje: 120300,
    proximoMantenimiento: '2026-05-25',
    urgencia: 'vencido',
    estado: 'activo',
  },
  {
    id: 'v3',
    clienteId: 'c1',
    matricula: '9012 GHI',
    marca: 'Volkswagen',
    modelo: 'Crafter',
    anio: 2023,
    color: 'Azul',
    kilometraje: 45200,
    proximoMantenimiento: '2026-08-15',
    urgencia: 'ok',
    estado: 'activo',
  },
  {
    id: 'v4',
    clienteId: 'c2',
    matricula: '3456 JKL',
    marca: 'Renault',
    modelo: 'Master',
    anio: 2020,
    color: 'Blanco',
    kilometraje: 156000,
    proximoMantenimiento: '2026-06-10',
    urgencia: 'ok',
    estado: 'activo',
  },
  {
    id: 'v5',
    clienteId: 'c3',
    matricula: '7890 MNO',
    marca: 'Iveco',
    modelo: 'Daily',
    anio: 2022,
    color: 'Rojo',
    kilometraje: 67800,
    proximoMantenimiento: '2026-05-22',
    urgencia: 'proximo',
    estado: 'activo',
  },
  {
    id: 'v6',
    clienteId: 'c3',
    matricula: '2345 PQR',
    marca: 'Peugeot',
    modelo: 'Boxer',
    anio: 2021,
    color: 'Gris',
    kilometraje: 98500,
    proximoMantenimiento: '2026-07-01',
    urgencia: 'ok',
    estado: 'activo',
  },
  {
    id: 'v7',
    clienteId: 'c5',
    matricula: '6789 STU',
    marca: 'Toyota',
    modelo: 'Proace',
    anio: 2024,
    color: 'Negro',
    kilometraje: 22100,
    proximoMantenimiento: '2026-09-01',
    urgencia: 'ok',
    estado: 'activo',
  },
  {
    id: 'v8',
    clienteId: 'c6',
    matricula: '0123 VWX',
    marca: 'Mercedes-Benz',
    modelo: 'Vito',
    anio: 2019,
    color: 'Plata',
    kilometraje: 198400,
    proximoMantenimiento: '2026-05-20',
    urgencia: 'vencido',
    estado: 'inactivo',
  },
];

export const garantias: Garantia[] = [
  {
    id: 'g1',
    vehiculoId: 'v1',
    concepto: 'Garantía de fábrica motor',
    proveedor: 'Mercedes-Benz',
    fechaInicio: '2022-03-01',
    fechaFin: '2027-03-01',
    estado: 'vigente',
  },
  {
    id: 'g2',
    vehiculoId: 'v2',
    concepto: 'Turbo reemplazado',
    proveedor: 'Taller oficial Ford',
    fechaInicio: '2026-01-15',
    fechaFin: '2027-01-15',
    estado: 'vigente',
    notas: 'Pieza OEM con 12 meses de garantía',
  },
  {
    id: 'g3',
    vehiculoId: 'v4',
    concepto: 'Batería auxiliar',
    proveedor: 'AutoEléctrica Sur',
    fechaInicio: '2025-06-01',
    fechaFin: '2026-06-01',
    estado: 'vencida',
  },
  {
    id: 'g4',
    vehiculoId: 'v5',
    concepto: 'Embrague completo',
    proveedor: 'Iveco Parts',
    fechaInicio: '2025-11-10',
    fechaFin: '2026-11-10',
    estado: 'vigente',
  },
  {
    id: 'g5',
    vehiculoId: 'v7',
    concepto: 'Pintura carrocería',
    proveedor: 'Carrocerías Pro',
    fechaInicio: '2024-08-01',
    fechaFin: '2025-08-01',
    estado: 'vencida',
  },
  {
    id: 'g6',
    vehiculoId: 'v8',
    concepto: 'Reparación caja de cambios',
    proveedor: 'Mercedes-Benz',
    fechaInicio: '2025-12-01',
    fechaFin: '2026-12-01',
    estado: 'anulada',
    notas: 'Anulada por incumplimiento de mantenimiento',
  },
];

export const garantiaEstadoLabels: Record<GarantiaEstado, string> = {
  vigente: 'Vigente',
  vencida: 'Vencida',
  anulada: 'Anulada',
};

export const citas: Cita[] = [
  {
    id: 'ci1',
    clienteId: 'c1',
    vehiculoId: 'v2',
    fecha: '2026-05-19',
    hora: '09:00',
    duracionMin: 60,
    servicioId: 'sv2',
    estado: 'confirmada',
  },
  {
    id: 'ci2',
    clienteId: 'c3',
    vehiculoId: 'v5',
    fecha: '2026-05-19',
    hora: '11:30',
    duracionMin: 90,
    servicioId: 'sv1',
    estado: 'pendiente',
  },
  {
    id: 'ci3',
    clienteId: 'c6',
    vehiculoId: 'v8',
    fecha: '2026-05-19',
    hora: '15:00',
    duracionMin: 120,
    servicioId: 'sv3',
    estado: 'confirmada',
  },
  {
    id: 'ci4',
    clienteId: 'c2',
    vehiculoId: 'v4',
    fecha: '2026-05-20',
    hora: '10:00',
    duracionMin: 60,
    servicioId: 'sv4',
    estado: 'pendiente',
  },
  {
    id: 'ci5',
    clienteId: 'c5',
    vehiculoId: 'v7',
    fecha: '2026-05-21',
    hora: '09:30',
    duracionMin: 45,
    servicioId: 'sv5',
    estado: 'confirmada',
  },
  {
    id: 'ci6',
    clienteId: 'c1',
    vehiculoId: 'v1',
    fecha: '2026-05-22',
    hora: '08:00',
    duracionMin: 180,
    servicioId: 'sv6',
    estado: 'pendiente',
  },
  {
    id: 'ci7',
    clienteId: 'c7',
    vehiculoId: 'v5',
    fecha: '2026-05-23',
    hora: '14:00',
    duracionMin: 60,
    servicioId: 'sv7',
    estado: 'confirmada',
  },
  {
    id: 'ci8',
    clienteId: 'c3',
    vehiculoId: 'v6',
    fecha: '2026-05-15',
    hora: '16:00',
    duracionMin: 90,
    servicioId: 'sv8',
    estado: 'completada',
  },
  {
    id: 'ci9',
    clienteId: 'c2',
    vehiculoId: 'v3',
    fecha: '2026-05-24',
    hora: '10:30',
    duracionMin: 60,
    servicioId: 'sv2',
    estado: 'pendiente',
  },
  {
    id: 'ci10',
    clienteId: 'c1',
    vehiculoId: 'v1',
    fecha: '2026-05-20',
    hora: '17:00',
    duracionMin: 45,
    servicioId: 'sv5',
    estado: 'cancelada',
    notas: 'Cliente canceló por viaje imprevisto',
  },
  {
    id: 'ci11',
    clienteId: 'c5',
    vehiculoId: 'v7',
    fecha: '2026-05-21',
    hora: '12:00',
    duracionMin: 90,
    servicioId: 'sv1',
    estado: 'pendiente',
  },
];

export const ordenesTrabajo: OrdenTrabajo[] = [
  {
    id: 'o1',
    numero: 'OT-2026-0142',
    tipo: 'reparacion',
    clienteId: 'c1',
    vehiculoId: 'v2',
    usuarioId: 'u1',
    estado: 'en_progreso',
    descripcion: 'Sustitución pastillas y discos de freno delanteros',
    fechaEntrada: '2026-05-18',
    fechaEstimada: '2026-05-20',
    totalEstimado: 485.5,
    piezasUsadas: [
      { piezaId: 'p3', cantidad: 1, precioUnitario: 45.0 },
      { piezaId: 'p4', cantidad: 1, precioUnitario: 89.0 },
    ],
    ordenComercialId: 'oc1',
    checklist: [
      { item: 'Diagnóstico inicial', completado: true },
      { item: 'Desmontaje ruedas', completado: true },
      { item: 'Sustitución pastillas', completado: false },
      { item: 'Prueba en banco', completado: false },
    ],
    timeline: [
      { fecha: '2026-05-18 08:30', estado: 'pendiente', nota: 'Vehículo recibido' },
      { fecha: '2026-05-18 10:00', estado: 'en_progreso', nota: 'Inicio reparación' },
    ],
  },
  {
    id: 'o2',
    numero: 'OT-2026-0143',
    tipo: 'reparacion',
    clienteId: 'c6',
    vehiculoId: 'v8',
    usuarioId: 'u2',
    estado: 'esperando_piezas',
    descripcion: 'Reparación turbocompresor',
    fechaEntrada: '2026-05-17',
    fechaEstimada: '2026-05-24',
    totalEstimado: 1250.0,
    piezasUsadas: [{ piezaId: 'p7', cantidad: 1, precioUnitario: 890.0 }],
    ordenComercialId: 'oc2',
    checklist: [
      { item: 'Diagnóstico OBD', completado: true },
      { item: 'Desmontaje turbo', completado: true },
      { item: 'Esperando pieza OEM', completado: false },
    ],
    timeline: [
      { fecha: '2026-05-17 09:00', estado: 'pendiente', nota: 'Ingreso taller' },
      { fecha: '2026-05-17 14:00', estado: 'en_progreso', nota: 'Diagnóstico confirmado' },
      { fecha: '2026-05-18 11:00', estado: 'esperando_piezas', nota: 'Pedido turbo enviado' },
    ],
  },
  {
    id: 'o3',
    numero: 'OT-2026-0144',
    tipo: 'mantenimiento',
    clienteId: 'c3',
    vehiculoId: 'v5',
    usuarioId: 'u3',
    estado: 'pendiente',
    descripcion: 'Cambio kit distribución',
    fechaEntrada: '2026-05-19',
    fechaEstimada: '2026-05-21',
    totalEstimado: 890.0,
    piezasUsadas: [{ piezaId: 'p8', cantidad: 1, precioUnitario: 245.0 }],
    checklist: [
      { item: 'Confirmar piezas en stock', completado: false },
      { item: 'Reservar bahía', completado: false },
    ],
    timeline: [{ fecha: '2026-05-19 07:45', estado: 'pendiente', nota: 'Orden creada' }],
  },
  {
    id: 'o4',
    numero: 'OT-2026-0138',
    tipo: 'mantenimiento',
    clienteId: 'c2',
    vehiculoId: 'v4',
    usuarioId: 'u1',
    estado: 'completado',
    descripcion: 'Revisión general 150.000 km',
    fechaEntrada: '2026-05-12',
    fechaEstimada: '2026-05-14',
    totalEstimado: 320.0,
    piezasUsadas: [
      { piezaId: 'p1', cantidad: 1, precioUnitario: 12.5 },
      { piezaId: 'p2', cantidad: 1, precioUnitario: 18.0 },
      { piezaId: 'p5', cantidad: 1, precioUnitario: 32.0 },
    ],
    ordenComercialId: 'oc4',
    checklist: [
      { item: 'Cambio aceite', completado: true },
      { item: 'Filtros', completado: true },
      { item: 'Revisión frenos', completado: true },
    ],
    timeline: [
      { fecha: '2026-05-12 08:00', estado: 'pendiente', nota: 'Ingreso' },
      { fecha: '2026-05-13 16:00', estado: 'en_progreso', nota: 'Trabajo en curso' },
      { fecha: '2026-05-14 12:00', estado: 'completado', nota: 'Entregado al cliente' },
    ],
  },
  {
    id: 'o5',
    numero: 'OT-2026-0145',
    tipo: 'reparacion',
    clienteId: 'c5',
    vehiculoId: 'v7',
    usuarioId: 'u4',
    estado: 'en_progreso',
    descripcion: 'Instalación sistema multimedia',
    fechaEntrada: '2026-05-19',
    fechaEstimada: '2026-05-19',
    totalEstimado: 275.0,
    piezasUsadas: [{ piezaId: 'p10', cantidad: 1, precioUnitario: 199.0 }],
    checklist: [
      { item: 'Desmontaje panel', completado: true },
      { item: 'Cableado', completado: false },
    ],
    timeline: [{ fecha: '2026-05-19 09:15', estado: 'en_progreso', nota: 'Instalación iniciada' }],
  },
  {
    id: 'o6',
    numero: 'OT-2026-0146',
    tipo: 'mantenimiento',
    clienteId: 'c1',
    vehiculoId: 'v1',
    usuarioId: 'u3',
    estado: 'pendiente',
    descripcion: 'Mantenimiento programado 85.000 km',
    fechaEntrada: '2026-05-20',
    fechaEstimada: '2026-05-22',
    totalEstimado: 410.0,
    piezasUsadas: [
      { piezaId: 'p1', cantidad: 1, precioUnitario: 12.5 },
      { piezaId: 'p5', cantidad: 1, precioUnitario: 32.0 },
      { piezaId: 'p9', cantidad: 1, precioUnitario: 28.0 },
    ],
    checklist: [
      { item: 'Verificar stock piezas', completado: true },
      { item: 'Programar bahía', completado: false },
    ],
    timeline: [{ fecha: '2026-05-20 08:00', estado: 'pendiente', nota: 'Orden programada' }],
  },
];

export const ordenesComerciales: OrdenComercial[] = [
  {
    id: 'oc1',
    numero: 'COT-2026-0089',
    tipo: 'cotizacion',
    estado: 'enviada',
    clienteId: 'c1',
    vehiculoId: 'v2',
    ordenTrabajoId: 'o1',
    fecha: '2026-05-18',
    validezHasta: '2026-06-18',
    lineas: [
      {
        id: 'l1',
        tipo: 'servicio',
        referenciaId: 'sv2',
        descripcion: 'Revisión frenos',
        cantidad: 1,
        precioUnitario: 45.0,
        subtotal: 45.0,
      },
      {
        id: 'l2',
        tipo: 'pieza',
        referenciaId: 'p3',
        descripcion: 'Pastillas freno delanteras',
        cantidad: 1,
        precioUnitario: 45.0,
        subtotal: 45.0,
      },
      {
        id: 'l3',
        tipo: 'pieza',
        referenciaId: 'p4',
        descripcion: 'Discos freno delanteros (par)',
        cantidad: 1,
        precioUnitario: 89.0,
        subtotal: 89.0,
      },
    ],
    subtotal: 179.0,
    iva: 37.59,
    total: 216.59,
  },
  {
    id: 'oc2',
    numero: 'COT-2026-0090',
    tipo: 'cotizacion',
    estado: 'aceptada',
    clienteId: 'c6',
    vehiculoId: 'v8',
    ordenTrabajoId: 'o2',
    fecha: '2026-05-17',
    validezHasta: '2026-06-17',
    lineas: [
      {
        id: 'l4',
        tipo: 'servicio',
        referenciaId: 'sv3',
        descripcion: 'Diagnóstico motor',
        cantidad: 1,
        precioUnitario: 65.0,
        subtotal: 65.0,
      },
      {
        id: 'l5',
        tipo: 'pieza',
        referenciaId: 'p7',
        descripcion: 'Turbocompresor OEM',
        cantidad: 1,
        precioUnitario: 890.0,
        subtotal: 890.0,
      },
    ],
    subtotal: 955.0,
    iva: 200.55,
    total: 1155.55,
  },
  {
    id: 'oc3',
    numero: 'COT-2026-0091',
    tipo: 'cotizacion',
    estado: 'borrador',
    clienteId: 'c3',
    vehiculoId: 'v5',
    ordenTrabajoId: 'o3',
    fecha: '2026-05-19',
    validezHasta: '2026-06-19',
    lineas: [
      {
        id: 'l6',
        tipo: 'pieza',
        referenciaId: 'p8',
        descripcion: 'Kit distribución completo',
        cantidad: 1,
        precioUnitario: 245.0,
        subtotal: 245.0,
      },
    ],
    subtotal: 245.0,
    iva: 51.45,
    total: 296.45,
  },
  {
    id: 'oc4',
    numero: 'FAC-2026-0045',
    tipo: 'factura',
    estado: 'pagada',
    clienteId: 'c2',
    vehiculoId: 'v4',
    ordenTrabajoId: 'o4',
    fecha: '2026-05-14',
    lineas: [
      {
        id: 'l7',
        tipo: 'servicio',
        referenciaId: 'sv6',
        descripcion: 'Mantenimiento 80.000 km',
        cantidad: 1,
        precioUnitario: 320.0,
        subtotal: 320.0,
      },
      {
        id: 'l8',
        tipo: 'pieza',
        referenciaId: 'p1',
        descripcion: 'Filtro de aceite',
        cantidad: 1,
        precioUnitario: 12.5,
        subtotal: 12.5,
      },
      {
        id: 'l9',
        tipo: 'pieza',
        referenciaId: 'p5',
        descripcion: 'Aceite 5W30 5L',
        cantidad: 1,
        precioUnitario: 32.0,
        subtotal: 32.0,
      },
    ],
    subtotal: 364.5,
    iva: 76.55,
    total: 441.05,
  },
  {
    id: 'oc5',
    numero: 'FAC-2026-0046',
    tipo: 'factura',
    estado: 'emitida',
    clienteId: 'c6',
    vehiculoId: 'v8',
    ordenTrabajoId: 'o2',
    fecha: '2026-05-18',
    lineas: [
      {
        id: 'l10',
        tipo: 'servicio',
        referenciaId: 'sv3',
        descripcion: 'Diagnóstico motor',
        cantidad: 1,
        precioUnitario: 65.0,
        subtotal: 65.0,
      },
      {
        id: 'l11',
        tipo: 'pieza',
        referenciaId: 'p7',
        descripcion: 'Turbocompresor OEM',
        cantidad: 1,
        precioUnitario: 890.0,
        subtotal: 890.0,
      },
    ],
    subtotal: 955.0,
    iva: 200.55,
    total: 1155.55,
  },
  {
    id: 'oc6',
    numero: 'FAC-2026-0047',
    tipo: 'factura',
    estado: 'emitida',
    clienteId: 'c1',
    vehiculoId: 'v2',
    fecha: '2026-05-10',
    lineas: [
      {
        id: 'l12',
        tipo: 'servicio',
        referenciaId: 'sv1',
        descripcion: 'Cambio aceite y filtros',
        cantidad: 1,
        precioUnitario: 89.0,
        subtotal: 89.0,
      },
    ],
    subtotal: 89.0,
    iva: 18.69,
    total: 107.69,
  },
  {
    id: 'oc7',
    numero: 'COT-2026-0092',
    tipo: 'cotizacion',
    estado: 'rechazada',
    clienteId: 'c5',
    vehiculoId: 'v7',
    fecha: '2026-05-08',
    validezHasta: '2026-06-08',
    lineas: [
      {
        id: 'l13',
        tipo: 'servicio',
        referenciaId: 'sv7',
        descripcion: 'Aire acondicionado',
        cantidad: 1,
        precioUnitario: 75.0,
        subtotal: 75.0,
      },
    ],
    subtotal: 75.0,
    iva: 15.75,
    total: 90.75,
  },
];

export const pagos: Pago[] = [
  {
    id: 'pg1',
    ordenComercialId: 'oc4',
    monto: 441.05,
    fecha: '2026-05-15',
    metodo: 'transferencia',
    referencia: 'TRF-20260515-0045',
  },
  {
    id: 'pg2',
    ordenComercialId: 'oc5',
    monto: 500.0,
    fecha: '2026-05-18',
    metodo: 'tarjeta',
    referencia: 'TXN-8847291',
    notas: 'Anticipo 43% del total',
  },
  {
    id: 'pg3',
    ordenComercialId: 'oc6',
    monto: 107.69,
    fecha: '2026-05-11',
    metodo: 'efectivo',
  },
  {
    id: 'pg4',
    ordenComercialId: 'oc5',
    monto: 300.0,
    fecha: '2026-05-19',
    metodo: 'transferencia',
    referencia: 'TRF-20260519-0046',
    notas: 'Segundo pago parcial',
  },
  {
    id: 'pg5',
    ordenComercialId: 'oc4',
    monto: 0,
    fecha: '2026-05-14',
    metodo: 'transferencia',
    notas: 'Registro anulado — duplicado',
  },
  {
    id: 'pg6',
    ordenComercialId: 'oc6',
    monto: 50.0,
    fecha: '2026-05-10',
    metodo: 'tarjeta',
    referencia: 'TXN-7721034',
    notas: 'Depósito previo al servicio',
  },
];

export const actividadReciente: ActividadReciente[] = [
  {
    id: 'a1',
    tipo: 'orden',
    titulo: 'OT-2026-0145 en progreso',
    descripcion: 'Instalación multimedia — Toyota Proace',
    fecha: '2026-05-19 09:15',
  },
  {
    id: 'a2',
    tipo: 'cita',
    titulo: 'Cita confirmada',
    descripcion: 'Revisión frenos — María García (09:00)',
    fecha: '2026-05-19 08:00',
  },
  {
    id: 'a3',
    tipo: 'cliente',
    titulo: 'Nuevo vehículo registrado',
    descripcion: 'Mercedes Vito añadido a Javier Ortega',
    fecha: '2026-05-18 17:30',
  },
  {
    id: 'a4',
    tipo: 'orden',
    titulo: 'OT-2026-0143 esperando piezas',
    descripcion: 'Turbo OEM — pedido enviado al proveedor',
    fecha: '2026-05-18 11:00',
  },
  {
    id: 'a5',
    tipo: 'pago',
    titulo: 'Pago registrado',
    descripcion: '500 € — FAC-2026-0046 (Javier Ortega)',
    fecha: '2026-05-18 16:20',
  },
  {
    id: 'a6',
    tipo: 'cita',
    titulo: 'Cita completada',
    descripcion: 'Reparación suspensión — Ana Fernández',
    fecha: '2026-05-15 17:30',
  },
];

export const citasPorDia = [
  { dia: 'Lun', citas: 4 },
  { dia: 'Mar', citas: 6 },
  { dia: 'Mié', citas: 5 },
  { dia: 'Jue', citas: 7 },
  { dia: 'Vie', citas: 8 },
  { dia: 'Sáb', citas: 3 },
  { dia: 'Dom', citas: 0 },
];

export const dashboardStats = {
  citasHoy: 3,
  citasHoyTrend: '+2',
  otsAbiertas: 5,
  otsAbiertasTrend: '-1',
  clientesActivos: clientes.filter((c) => c.estado === 'activo').length,
  clientesTrend: '+3',
  ingresosMes: 28450,
  ingresosTrend: '+12%',
  piezasStockBajo: piezas.filter((p) => p.stock <= p.stockMinimo).length,
  facturasPendientes: ordenesComerciales.filter(
    (o) => o.tipo === 'factura' && o.estado === 'emitida'
  ).length,
};

export function getClienteById(id: string): Cliente | undefined {
  return clientes.find((c) => c.id === id);
}

export function getVehiculoById(id: string): Vehiculo | undefined {
  return vehiculos.find((v) => v.id === id);
}

export function getVehiculosByClienteId(clienteId: string): Vehiculo[] {
  return vehiculos.filter((v) => v.clienteId === clienteId);
}

export function getCitaById(id: string): Cita | undefined {
  return citas.find((c) => c.id === id);
}

export function getCitasByVehiculoId(vehiculoId: string): Cita[] {
  return citas.filter((c) => c.vehiculoId === vehiculoId);
}

export function getOrdenesTrabajoByVehiculoId(vehiculoId: string): OrdenTrabajo[] {
  return ordenesTrabajo.filter((o) => o.vehiculoId === vehiculoId);
}

export function getOrdenesComercialesByVehiculoId(vehiculoId: string): OrdenComercial[] {
  return ordenesComerciales.filter((o) => o.vehiculoId === vehiculoId);
}

export function getGarantiasByVehiculoId(vehiculoId: string): Garantia[] {
  return garantias.filter((g) => g.vehiculoId === vehiculoId);
}

export function getPiezasUsadasByVehiculoId(vehiculoId: string): PiezaUsadaVehiculo[] {
  const ordenes = getOrdenesTrabajoByVehiculoId(vehiculoId);
  const result: PiezaUsadaVehiculo[] = [];
  for (const orden of ordenes) {
    for (const pu of orden.piezasUsadas) {
      result.push({
        piezaId: pu.piezaId,
        piezaNombre: getPiezaNombre(pu.piezaId),
        cantidad: pu.cantidad,
        precioUnitario: pu.precioUnitario,
        ordenTrabajoId: orden.id,
        ordenNumero: orden.numero,
        fechaEntrada: orden.fechaEntrada,
      });
    }
  }
  return result;
}

export function getCitasByClienteId(clienteId: string): Cita[] {
  return citas.filter((c) => c.clienteId === clienteId);
}

export function getOrdenesTrabajoByClienteId(clienteId: string): OrdenTrabajo[] {
  return ordenesTrabajo.filter((o) => o.clienteId === clienteId);
}

export function getOrdenTrabajoById(id: string): OrdenTrabajo | undefined {
  return ordenesTrabajo.find((o) => o.id === id);
}

export function getUsuarioById(id: string): Usuario | undefined {
  return usuarios.find((u) => u.id === id);
}

export function getRolById(id: string): Rol | undefined {
  return roles.find((r) => r.id === id);
}

export function getRolNombre(rolId: string): string {
  return getRolById(rolId)?.nombre ?? 'Sin rol';
}

export function getPiezaById(id: string): Pieza | undefined {
  return piezas.find((p) => p.id === id);
}

export function getServicioById(id: string): Servicio | undefined {
  return servicios.find((s) => s.id === id);
}

export function getServicioNombre(servicioId: string): string {
  return getServicioById(servicioId)?.nombre ?? 'Servicio desconocido';
}

export function getOrdenComercialById(id: string): OrdenComercial | undefined {
  return ordenesComerciales.find((o) => o.id === id);
}

export function getOrdenesComercialesByClienteId(clienteId: string): OrdenComercial[] {
  return ordenesComerciales.filter((o) => o.clienteId === clienteId);
}

export function getOrdenComercialByOrdenTrabajoId(
  ordenTrabajoId: string
): OrdenComercial | undefined {
  return ordenesComerciales.find((o) => o.ordenTrabajoId === ordenTrabajoId);
}

export function getPagosByOrdenComercialId(ordenComercialId: string): Pago[] {
  return pagos.filter((p) => p.ordenComercialId === ordenComercialId && p.monto > 0);
}

export function getPagosByClienteId(clienteId: string): Pago[] {
  const ordenIds = ordenesComerciales
    .filter((o) => o.clienteId === clienteId)
    .map((o) => o.id);
  return pagos.filter((p) => ordenIds.includes(p.ordenComercialId) && p.monto > 0);
}

export function getTotalPagado(ordenComercialId: string): number {
  return getPagosByOrdenComercialId(ordenComercialId).reduce((sum, p) => sum + p.monto, 0);
}

export function getUsuariosByRolId(rolId: string): Usuario[] {
  return usuarios.filter((u) => u.rolId === rolId);
}

export function getClienteNombre(clienteId: string): string {
  return getClienteById(clienteId)?.nombre ?? 'Desconocido';
}

export function getVehiculoLabel(vehiculoId: string): string {
  const v = getVehiculoById(vehiculoId);
  return v ? `${v.marca} ${v.modelo} (${v.matricula})` : 'Desconocido';
}

export function getPiezaNombre(piezaId: string): string {
  return getPiezaById(piezaId)?.nombre ?? 'Pieza desconocida';
}

export const ordenEstadoLabels: Record<OrdenEstado, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  esperando_piezas: 'Esperando piezas',
  completado: 'Completado',
};

export const ordenTrabajoTipoLabels: Record<OrdenTrabajoTipo, string> = {
  mantenimiento: 'Mantenimiento',
  reparacion: 'Reparación',
};

export const citaEstadoLabels: Record<CitaEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export const ordenComercialTipoLabels: Record<OrdenComercialTipo, string> = {
  cotizacion: 'Cotización',
  factura: 'Factura',
};

export const cotizacionEstadoLabels: Record<CotizacionEstado, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  convertida: 'Convertida',
};

export const facturaEstadoLabels: Record<FacturaEstado, string> = {
  borrador: 'Borrador',
  emitida: 'Emitida',
  pagada: 'Pagada',
  vencida: 'Vencida',
  anulada: 'Anulada',
};

export function getOrdenComercialEstadoLabel(orden: OrdenComercial): string {
  if (orden.tipo === 'cotizacion') {
    return cotizacionEstadoLabels[orden.estado as CotizacionEstado];
  }
  return facturaEstadoLabels[orden.estado as FacturaEstado];
}

export const pagoMetodoLabels: Record<PagoMetodo, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export const piezaCategorias = [...new Set(piezas.map((p) => p.categoria))];
export const servicioCategorias = [...new Set(servicios.map((s) => s.categoria))];
