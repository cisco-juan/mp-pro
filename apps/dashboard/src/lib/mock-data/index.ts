export type ClienteEstado = 'activo' | 'inactivo';
export type CitaEstado = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
export type OrdenEstado =
  | 'pendiente'
  | 'en_progreso'
  | 'esperando_piezas'
  | 'completado';
export type MantenimientoUrgencia = 'ok' | 'proximo' | 'vencido';

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  estado: ClienteEstado;
  vehiculosCount: number;
  ultimaVisita: string;
  notas?: string;
}

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
}

export interface Cita {
  id: string;
  clienteId: string;
  vehiculoId: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  servicio: string;
  estado: CitaEstado;
  notas?: string;
}

export interface OrdenMantenimiento {
  id: string;
  numero: string;
  clienteId: string;
  vehiculoId: string;
  staffId: string;
  estado: OrdenEstado;
  descripcion: string;
  fechaEntrada: string;
  fechaEstimada: string;
  totalEstimado: number;
  checklist: { item: string; completado: boolean }[];
  timeline: { fecha: string; estado: OrdenEstado; nota: string }[];
}

export interface StaffMember {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
  ordenesActivas: number;
}

export interface ActividadReciente {
  id: string;
  tipo: 'cita' | 'orden' | 'cliente';
  titulo: string;
  descripcion: string;
  fecha: string;
}

export const clientes: Cliente[] = [
  {
    id: 'c1',
    nombre: 'María García López',
    email: 'maria.garcia@email.com',
    telefono: '+34 612 345 678',
    empresa: 'Transportes García',
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
    estado: 'activo',
    vehiculosCount: 1,
    ultimaVisita: '2026-05-10',
  },
  {
    id: 'c3',
    nombre: 'Ana Fernández Soto',
    email: 'ana.fernandez@email.com',
    telefono: '+34 634 567 890',
    empresa: 'Fernández Logistics',
    estado: 'activo',
    vehiculosCount: 5,
    ultimaVisita: '2026-05-18',
  },
  {
    id: 'c4',
    nombre: 'Pedro Jiménez Vega',
    email: 'pedro.jimenez@email.com',
    telefono: '+34 645 678 901',
    estado: 'inactivo',
    vehiculosCount: 2,
    ultimaVisita: '2026-01-20',
  },
  {
    id: 'c5',
    nombre: 'Laura Méndez Costa',
    email: 'laura.mendez@email.com',
    telefono: '+34 656 789 012',
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
    estado: 'activo',
    vehiculosCount: 4,
    ultimaVisita: '2026-05-17',
  },
  {
    id: 'c7',
    nombre: 'Isabel Torres Ríos',
    email: 'isabel.torres@email.com',
    telefono: '+34 678 901 234',
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
  },
];

export const citas: Cita[] = [
  {
    id: 'ci1',
    clienteId: 'c1',
    vehiculoId: 'v2',
    fecha: '2026-05-19',
    hora: '09:00',
    duracionMin: 60,
    servicio: 'Revisión frenos',
    estado: 'confirmada',
  },
  {
    id: 'ci2',
    clienteId: 'c3',
    vehiculoId: 'v5',
    fecha: '2026-05-19',
    hora: '11:30',
    duracionMin: 90,
    servicio: 'Cambio aceite y filtros',
    estado: 'pendiente',
  },
  {
    id: 'ci3',
    clienteId: 'c6',
    vehiculoId: 'v8',
    fecha: '2026-05-19',
    hora: '15:00',
    duracionMin: 120,
    servicio: 'Diagnóstico motor',
    estado: 'confirmada',
  },
  {
    id: 'ci4',
    clienteId: 'c2',
    vehiculoId: 'v4',
    fecha: '2026-05-20',
    hora: '10:00',
    duracionMin: 60,
    servicio: 'ITV pre-revisión',
    estado: 'pendiente',
  },
  {
    id: 'ci5',
    clienteId: 'c5',
    vehiculoId: 'v7',
    fecha: '2026-05-21',
    hora: '09:30',
    duracionMin: 45,
    servicio: 'Rotación neumáticos',
    estado: 'confirmada',
  },
  {
    id: 'ci6',
    clienteId: 'c1',
    vehiculoId: 'v1',
    fecha: '2026-05-22',
    hora: '08:00',
    duracionMin: 180,
    servicio: 'Mantenimiento 80.000 km',
    estado: 'pendiente',
  },
  {
    id: 'ci7',
    clienteId: 'c7',
    vehiculoId: 'v5',
    fecha: '2026-05-23',
    hora: '14:00',
    duracionMin: 60,
    servicio: 'Aire acondicionado',
    estado: 'confirmada',
  },
  {
    id: 'ci8',
    clienteId: 'c3',
    vehiculoId: 'v6',
    fecha: '2026-05-15',
    hora: '16:00',
    duracionMin: 90,
    servicio: 'Reparación suspensión',
    estado: 'completada',
  },
];

export const ordenes: OrdenMantenimiento[] = [
  {
    id: 'o1',
    numero: 'OT-2026-0142',
    clienteId: 'c1',
    vehiculoId: 'v2',
    staffId: 's1',
    estado: 'en_progreso',
    descripcion: 'Sustitución pastillas y discos de freno delanteros',
    fechaEntrada: '2026-05-18',
    fechaEstimada: '2026-05-20',
    totalEstimado: 485.5,
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
    clienteId: 'c6',
    vehiculoId: 'v8',
    staffId: 's2',
    estado: 'esperando_piezas',
    descripcion: 'Reparación turbocompresor',
    fechaEntrada: '2026-05-17',
    fechaEstimada: '2026-05-24',
    totalEstimado: 1250.0,
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
    clienteId: 'c3',
    vehiculoId: 'v5',
    staffId: 's3',
    estado: 'pendiente',
    descripcion: 'Cambio kit distribución',
    fechaEntrada: '2026-05-19',
    fechaEstimada: '2026-05-21',
    totalEstimado: 890.0,
    checklist: [
      { item: 'Confirmar piezas en stock', completado: false },
      { item: 'Reservar bahía', completado: false },
    ],
    timeline: [
      { fecha: '2026-05-19 07:45', estado: 'pendiente', nota: 'Orden creada' },
    ],
  },
  {
    id: 'o4',
    numero: 'OT-2026-0138',
    clienteId: 'c2',
    vehiculoId: 'v4',
    staffId: 's1',
    estado: 'completado',
    descripcion: 'Revisión general 150.000 km',
    fechaEntrada: '2026-05-12',
    fechaEstimada: '2026-05-14',
    totalEstimado: 320.0,
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
    clienteId: 'c5',
    vehiculoId: 'v7',
    staffId: 's4',
    estado: 'en_progreso',
    descripcion: 'Instalación sistema multimedia',
    fechaEntrada: '2026-05-19',
    fechaEstimada: '2026-05-19',
    totalEstimado: 275.0,
    checklist: [
      { item: 'Desmontaje panel', completado: true },
      { item: 'Cableado', completado: false },
    ],
    timeline: [
      { fecha: '2026-05-19 09:15', estado: 'en_progreso', nota: 'Instalación iniciada' },
    ],
  },
];

export const staff: StaffMember[] = [
  {
    id: 's1',
    nombre: 'Roberto Díaz',
    email: 'roberto.diaz@mppro.local',
    telefono: '+34 600 111 222',
    rol: 'Mecánico senior',
    activo: true,
    ordenesActivas: 2,
  },
  {
    id: 's2',
    nombre: 'Elena Vargas',
    email: 'elena.vargas@mppro.local',
    telefono: '+34 600 222 333',
    rol: 'Mecánica especialista motor',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 's3',
    nombre: 'David Molina',
    email: 'david.molina@mppro.local',
    telefono: '+34 600 333 444',
    rol: 'Mecánico',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 's4',
    nombre: 'Sofía Herrera',
    email: 'sofia.herrera@mppro.local',
    telefono: '+34 600 444 555',
    rol: 'Electricista automoción',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 's5',
    nombre: 'Antonio Reyes',
    email: 'antonio.reyes@mppro.local',
    telefono: '+34 600 555 666',
    rol: 'Recepcionista',
    activo: true,
    ordenesActivas: 0,
  },
  {
    id: 's6',
    nombre: 'Carmen López',
    email: 'carmen.lopez@mppro.local',
    telefono: '+34 600 666 777',
    rol: 'Administración',
    activo: true,
    ordenesActivas: 0,
  },
  {
    id: 's7',
    nombre: 'Francisco Núñez',
    email: 'francisco.nunez@mppro.local',
    telefono: '+34 600 777 888',
    rol: 'Mecánico',
    activo: false,
    ordenesActivas: 0,
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
  otsAbiertas: 4,
  otsAbiertasTrend: '-1',
  clientesActivos: clientes.filter((c) => c.estado === 'activo').length,
  clientesTrend: '+3',
  ingresosMes: 28450,
  ingresosTrend: '+12%',
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

export function getCitasByClienteId(clienteId: string): Cita[] {
  return citas.filter((c) => c.clienteId === clienteId);
}

export function getOrdenesByClienteId(clienteId: string): OrdenMantenimiento[] {
  return ordenes.filter((o) => o.clienteId === clienteId);
}

export function getOrdenById(id: string): OrdenMantenimiento | undefined {
  return ordenes.find((o) => o.id === id);
}

export function getStaffById(id: string): StaffMember | undefined {
  return staff.find((s) => s.id === id);
}

export function getClienteNombre(clienteId: string): string {
  return getClienteById(clienteId)?.nombre ?? 'Desconocido';
}

export function getVehiculoLabel(vehiculoId: string): string {
  const v = getVehiculoById(vehiculoId);
  return v ? `${v.marca} ${v.modelo} (${v.matricula})` : 'Desconocido';
}

export const ordenEstadoLabels: Record<OrdenEstado, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  esperando_piezas: 'Esperando piezas',
  completado: 'Completado',
};

export const citaEstadoLabels: Record<CitaEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};
