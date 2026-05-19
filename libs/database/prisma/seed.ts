import 'dotenv/config';
import { createPrismaClient } from '../src/lib/prisma.js';

const DEFAULT_PASSWORD = 'Admin123!';

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 10);
}

const ROLES = [
  {
    id: 'r1',
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    permisos: [
      'taller:write',
      'ordenes:write',
      'ordenes:read',
      'pagos:write',
      'pagos:read',
      'usuarios:write',
      'inventario:write',
      'inventario:read',
      'clientes:write',
      'clientes:read',
      'citas:write',
      'citas:read',
      'servicios:write',
      'servicios:read',
    ],
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
    permisos: ['citas:write', 'citas:read', 'clientes:write', 'ordenes:write', 'ordenes:read', 'pagos:read', 'servicios:read'],
  },
  {
    id: 'r4',
    nombre: 'Administración',
    descripcion: 'Facturación y pagos',
    permisos: ['ordenes:write', 'pagos:write', 'clientes:read'],
  },
] as const;

const USERS = [
  {
    id: 'u1',
    nombre: 'Roberto Díaz',
    email: 'roberto.diaz@mppro.local',
    telefono: '+34 600 111 222',
    roleId: 'r2',
    activo: true,
    ordenesActivas: 2,
  },
  {
    id: 'u2',
    nombre: 'Elena Vargas',
    email: 'elena.vargas@mppro.local',
    telefono: '+34 600 222 333',
    roleId: 'r2',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 'u3',
    nombre: 'David Molina',
    email: 'david.molina@mppro.local',
    telefono: '+34 600 333 444',
    roleId: 'r2',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 'u4',
    nombre: 'Sofía Herrera',
    email: 'sofia.herrera@mppro.local',
    telefono: '+34 600 444 555',
    roleId: 'r2',
    activo: true,
    ordenesActivas: 1,
  },
  {
    id: 'u5',
    nombre: 'Antonio Reyes',
    email: 'antonio.reyes@mppro.local',
    telefono: '+34 600 555 666',
    roleId: 'r3',
    activo: true,
    ordenesActivas: 0,
  },
  {
    id: 'u6',
    nombre: 'Carmen López',
    email: 'carmen.lopez@mppro.local',
    telefono: '+34 600 666 777',
    roleId: 'r4',
    activo: true,
    ordenesActivas: 0,
  },
  {
    id: 'u7',
    nombre: 'Francisco Núñez',
    email: 'francisco.nunez@mppro.local',
    telefono: '+34 600 777 888',
    roleId: 'r2',
    activo: false,
    ordenesActivas: 0,
  },
  {
    id: 'u8',
    nombre: 'Admin MP Pro',
    email: 'admin@mppro.local',
    telefono: '+34 600 000 001',
    roleId: 'r1',
    activo: true,
    ordenesActivas: 0,
  },
] as const;

const CLIENTS = [
  {
    id: 'c1',
    nombre: 'María García López',
    email: 'maria.garcia@email.com',
    telefono: '+34 612 345 678',
    telefonoSecundario: '+34 912 345 678',
    empresa: 'Transportes García',
    direccionLinea1: 'Polígono Industrial Norte, 12',
    direccionCiudad: 'Madrid',
    direccionCodigoPostal: '28050',
    direccionProvincia: 'Madrid',
    documentoTipo: 'cif' as const,
    documentoNumero: 'B12345678',
    estado: 'activo' as const,
    ultimaVisita: new Date('2026-05-15'),
    notas: 'Cliente preferente, facturación mensual.',
  },
  {
    id: 'c2',
    nombre: 'Carlos Ruiz Martín',
    email: 'carlos.ruiz@email.com',
    telefono: '+34 623 456 789',
    direccionLinea1: 'Calle Mayor 45, 3ºB',
    direccionCiudad: 'Alcalá de Henares',
    direccionCodigoPostal: '28801',
    direccionProvincia: 'Madrid',
    documentoTipo: 'dni' as const,
    documentoNumero: '12345678A',
    estado: 'activo' as const,
    ultimaVisita: new Date('2026-05-10'),
  },
] as const;

const VEHICLES = [
  {
    id: 'v1',
    clientId: 'c1',
    matricula: '1234 ABC',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter',
    anio: 2022,
    color: 'Blanco',
    kilometraje: 85400,
    proximoMantenimiento: new Date('2026-06-01'),
    estado: 'activo' as const,
  },
  {
    id: 'v2',
    clientId: 'c1',
    matricula: '5678 DEF',
    marca: 'Ford',
    modelo: 'Transit',
    anio: 2021,
    color: 'Gris',
    kilometraje: 120300,
    proximoMantenimiento: new Date('2026-05-25'),
    estado: 'activo' as const,
  },
  {
    id: 'v3',
    clientId: 'c2',
    matricula: '3456 JKL',
    marca: 'Renault',
    modelo: 'Master',
    anio: 2020,
    color: 'Blanco',
    kilometraje: 156000,
    proximoMantenimiento: new Date('2026-06-10'),
    estado: 'activo' as const,
  },
] as const;

const INVENTORY_PARTS = [
  {
    id: 'p1',
    codigo: 'FLT-OIL-001',
    nombre: 'Filtro de aceite',
    categoria: 'Filtros',
    stock: 24,
    stockMinimo: 10,
    precioUnitario: 12.5,
    ubicacion: 'A-01',
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
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
    estado: 'activo' as const,
  },
] as const;

const WORK_ORDERS = [
  {
    id: 'o1',
    numero: 'OT-2026-0142',
    tipo: 'reparacion' as const,
    clientId: 'c1',
    vehicleId: 'v2',
    assignedUserId: 'u1',
    estado: 'en_progreso' as const,
    descripcion: 'Sustitución pastillas y discos de freno delanteros',
    fechaEntrada: new Date('2026-05-18'),
    fechaEstimada: new Date('2026-05-20'),
    totalEstimado: 134,
    ordenComercialId: 'oc1',
    parts: [
      { inventoryPartId: 'p3', cantidad: 1, precioUnitario: 45 },
      { inventoryPartId: 'p4', cantidad: 1, precioUnitario: 89 },
    ],
    checklist: [
      { orden: 0, item: 'Diagnóstico inicial', completado: true },
      { orden: 1, item: 'Desmontaje', completado: true },
      { orden: 2, item: 'Sustitución / reparación', completado: false },
      { orden: 3, item: 'Montaje', completado: false },
      { orden: 4, item: 'Prueba en banco', completado: false },
    ],
    timeline: [
      {
        fecha: new Date('2026-05-18T08:30:00'),
        estado: 'pendiente' as const,
        nota: 'Vehículo recibido',
      },
      {
        fecha: new Date('2026-05-18T10:00:00'),
        estado: 'en_progreso' as const,
        nota: 'Inicio reparación',
      },
    ],
  },
  {
    id: 'o2',
    numero: 'OT-2026-0143',
    tipo: 'reparacion' as const,
    clientId: 'c2',
    vehicleId: 'v3',
    assignedUserId: 'u2',
    estado: 'esperando_piezas' as const,
    descripcion: 'Reparación turbocompresor',
    fechaEntrada: new Date('2026-05-17'),
    fechaEstimada: new Date('2026-05-24'),
    totalEstimado: 890,
    ordenComercialId: 'oc2',
    parts: [{ inventoryPartId: 'p7', cantidad: 1, precioUnitario: 890 }],
    checklist: [
      { orden: 0, item: 'Diagnóstico inicial', completado: true },
      { orden: 1, item: 'Desmontaje', completado: true },
      { orden: 2, item: 'Sustitución / reparación', completado: false },
      { orden: 3, item: 'Montaje', completado: false },
      { orden: 4, item: 'Prueba en banco', completado: false },
    ],
    timeline: [
      {
        fecha: new Date('2026-05-17T09:00:00'),
        estado: 'pendiente' as const,
        nota: 'Ingreso taller',
      },
      {
        fecha: new Date('2026-05-17T14:00:00'),
        estado: 'en_progreso' as const,
        nota: 'Diagnóstico confirmado',
      },
      {
        fecha: new Date('2026-05-18T11:00:00'),
        estado: 'esperando_piezas' as const,
        nota: 'Pedido turbo enviado',
      },
    ],
  },
  {
    id: 'o3',
    numero: 'OT-2026-0144',
    tipo: 'mantenimiento' as const,
    clientId: 'c1',
    vehicleId: 'v1',
    assignedUserId: 'u3',
    estado: 'pendiente' as const,
    descripcion: 'Cambio kit distribución',
    fechaEntrada: new Date('2026-05-19'),
    fechaEstimada: new Date('2026-05-21'),
    totalEstimado: 245,
    parts: [{ inventoryPartId: 'p8', cantidad: 1, precioUnitario: 245 }],
    checklist: [
      { orden: 0, item: 'Confirmar piezas en stock', completado: false },
      { orden: 1, item: 'Reservar bahía', completado: false },
      { orden: 2, item: 'Cambio aceite', completado: false },
      { orden: 3, item: 'Filtros', completado: false },
      { orden: 4, item: 'Revisión general', completado: false },
      { orden: 5, item: 'Prueba en banco', completado: false },
    ],
    timeline: [
      {
        fecha: new Date('2026-05-19T07:45:00'),
        estado: 'pendiente' as const,
        nota: 'Orden creada',
      },
    ],
  },
  {
    id: 'o4',
    numero: 'OT-2026-0138',
    tipo: 'mantenimiento' as const,
    clientId: 'c2',
    vehicleId: 'v3',
    assignedUserId: 'u1',
    estado: 'completado' as const,
    descripcion: 'Revisión general 150.000 km',
    fechaEntrada: new Date('2026-05-12'),
    fechaEstimada: new Date('2026-05-14'),
    totalEstimado: 62.5,
    ordenComercialId: 'oc4',
    parts: [
      { inventoryPartId: 'p1', cantidad: 1, precioUnitario: 12.5 },
      { inventoryPartId: 'p2', cantidad: 1, precioUnitario: 18 },
      { inventoryPartId: 'p5', cantidad: 1, precioUnitario: 32 },
    ],
    checklist: [
      { orden: 0, item: 'Confirmar piezas en stock', completado: true },
      { orden: 1, item: 'Reservar bahía', completado: true },
      { orden: 2, item: 'Cambio aceite', completado: true },
      { orden: 3, item: 'Filtros', completado: true },
      { orden: 4, item: 'Revisión general', completado: true },
      { orden: 5, item: 'Prueba en banco', completado: true },
    ],
    timeline: [
      {
        fecha: new Date('2026-05-12T08:00:00'),
        estado: 'pendiente' as const,
        nota: 'Ingreso',
      },
      {
        fecha: new Date('2026-05-13T16:00:00'),
        estado: 'en_progreso' as const,
        nota: 'Trabajo en curso',
      },
      {
        fecha: new Date('2026-05-14T12:00:00'),
        estado: 'completado' as const,
        nota: 'Entregado al cliente',
      },
    ],
  },
] as const;

const SERVICES = [
  {
    id: 'sv1',
    nombre: 'Cambio aceite y filtros',
    descripcion: 'Aceite sintético 5W30 y filtros de aceite y aire',
    precio: 89,
    duracionMin: 60,
    categoria: 'Mantenimiento',
    activo: true,
  },
  {
    id: 'sv2',
    nombre: 'Revisión frenos',
    descripcion: 'Inspección pastillas, discos y líquido de frenos',
    precio: 45,
    duracionMin: 45,
    categoria: 'Frenos',
    activo: true,
  },
  {
    id: 'sv3',
    nombre: 'Diagnóstico motor',
    descripcion: 'Lectura OBD y diagnóstico completo del motor',
    precio: 65,
    duracionMin: 90,
    categoria: 'Motor',
    activo: true,
  },
  {
    id: 'sv4',
    nombre: 'ITV pre-revisión',
    descripcion: 'Comprobación previa a la inspección técnica',
    precio: 35,
    duracionMin: 60,
    categoria: 'Inspección',
    activo: true,
  },
] as const;

const APPOINTMENTS = [
  {
    id: 'ci1',
    clientId: 'c1',
    vehicleId: 'v2',
    serviceId: 'sv2',
    fecha: new Date('2026-05-19'),
    hora: '09:00',
    duracionMin: 60,
    estado: 'confirmada' as const,
  },
  {
    id: 'ci2',
    clientId: 'c2',
    vehicleId: 'v3',
    serviceId: 'sv4',
    fecha: new Date('2026-05-20'),
    hora: '10:00',
    duracionMin: 60,
    estado: 'pendiente' as const,
  },
] as const;

const COMMERCIAL_ORDERS = [
  {
    id: 'oc1',
    numero: 'COT-2026-0089',
    tipo: 'cotizacion' as const,
    estado: 'enviada' as const,
    clientId: 'c1',
    vehicleId: 'v2',
    fecha: new Date('2026-05-18'),
    validezHasta: new Date('2026-06-18'),
    subtotal: 179,
    iva: 37.59,
    total: 216.59,
    workOrderId: 'o1',
    lineas: [
      {
        orden: 0,
        tipo: 'servicio' as const,
        referenciaId: 'sv2',
        descripcion: 'Revisión frenos',
        cantidad: 1,
        precioUnitario: 45,
        subtotal: 45,
      },
      {
        orden: 1,
        tipo: 'pieza' as const,
        referenciaId: 'p3',
        descripcion: 'Pastillas freno delanteras',
        cantidad: 1,
        precioUnitario: 45,
        subtotal: 45,
      },
      {
        orden: 2,
        tipo: 'pieza' as const,
        referenciaId: 'p4',
        descripcion: 'Discos freno delanteros (par)',
        cantidad: 1,
        precioUnitario: 89,
        subtotal: 89,
      },
    ],
  },
  {
    id: 'oc2',
    numero: 'COT-2026-0090',
    tipo: 'cotizacion' as const,
    estado: 'aceptada' as const,
    clientId: 'c2',
    vehicleId: 'v3',
    fecha: new Date('2026-05-17'),
    validezHasta: new Date('2026-06-17'),
    subtotal: 955,
    iva: 200.55,
    total: 1155.55,
    workOrderId: 'o2',
    lineas: [
      {
        orden: 0,
        tipo: 'servicio' as const,
        referenciaId: 'sv3',
        descripcion: 'Diagnóstico motor',
        cantidad: 1,
        precioUnitario: 65,
        subtotal: 65,
      },
      {
        orden: 1,
        tipo: 'pieza' as const,
        referenciaId: 'p7',
        descripcion: 'Turbocompresor OEM',
        cantidad: 1,
        precioUnitario: 890,
        subtotal: 890,
      },
    ],
  },
  {
    id: 'oc4',
    numero: 'FAC-2026-0045',
    tipo: 'factura' as const,
    estado: 'pagada' as const,
    clientId: 'c2',
    vehicleId: 'v3',
    fecha: new Date('2026-05-14'),
    validezHasta: null,
    subtotal: 62.5,
    iva: 13.13,
    total: 75.63,
    workOrderId: 'o4',
    lineas: [
      {
        orden: 0,
        tipo: 'pieza' as const,
        referenciaId: 'p1',
        descripcion: 'Filtro de aceite',
        cantidad: 1,
        precioUnitario: 12.5,
        subtotal: 12.5,
      },
      {
        orden: 1,
        tipo: 'pieza' as const,
        referenciaId: 'p2',
        descripcion: 'Filtro de aire',
        cantidad: 1,
        precioUnitario: 18,
        subtotal: 18,
      },
      {
        orden: 2,
        tipo: 'pieza' as const,
        referenciaId: 'p5',
        descripcion: 'Aceite 5W30 5L',
        cantidad: 1,
        precioUnitario: 32,
        subtotal: 32,
      },
    ],
  },
] as const;

const PAYMENTS = [
  {
    id: 'pg1',
    commercialOrderId: 'oc4',
    monto: 75.63,
    fecha: new Date('2026-05-15'),
    metodo: 'transferencia' as const,
    referencia: 'TRF-20260515-0045',
  },
] as const;

const WORKSHOP_SETTINGS = {
  id: 'default',
  nombreTaller: 'Taller MP Pro',
  cif: 'B12345678',
  direccion: 'Calle Industria 42, 28001 Madrid',
  horaApertura: '08:00',
  horaCierre: '19:00',
  bahias: 6,
  notifCitas: true,
  notifOrdenes: true,
  notifRecordatorios: true,
  serieCotizacion: 'COT-2026',
  serieFactura: 'FAC-2026',
  ivaPorcentaje: 21,
} as const;

async function main(): Promise<void> {
  const prisma = createPrismaClient();
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { id: role.id },
      create: role,
      update: {
        nombre: role.nombre,
        descripcion: role.descripcion,
        permisos: [...role.permisos],
      },
    });
  }

  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        ...user,
        passwordHash,
      },
      update: {
        nombre: user.nombre,
        telefono: user.telefono,
        roleId: user.roleId,
        activo: user.activo,
        ordenesActivas: user.ordenesActivas,
        passwordHash,
      },
    });
  }

  for (const client of CLIENTS) {
    await prisma.client.upsert({
      where: { id: client.id },
      create: client,
      update: {
        nombre: client.nombre,
        email: client.email,
        telefono: client.telefono,
        telefonoSecundario: client.telefonoSecundario,
        empresa: client.empresa,
        direccionLinea1: client.direccionLinea1,
        direccionCiudad: client.direccionCiudad,
        direccionCodigoPostal: client.direccionCodigoPostal,
        direccionProvincia: client.direccionProvincia,
        documentoTipo: client.documentoTipo,
        documentoNumero: client.documentoNumero,
        estado: client.estado,
        ultimaVisita: client.ultimaVisita,
        notas: client.notas,
      },
    });
  }

  for (const vehicle of VEHICLES) {
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      create: vehicle,
      update: {
        clientId: vehicle.clientId,
        matricula: vehicle.matricula,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio,
        color: vehicle.color,
        kilometraje: vehicle.kilometraje,
        proximoMantenimiento: vehicle.proximoMantenimiento,
        estado: vehicle.estado,
      },
    });
  }

  await prisma.workshopSettings.upsert({
    where: { id: WORKSHOP_SETTINGS.id },
    create: WORKSHOP_SETTINGS,
    update: WORKSHOP_SETTINGS,
  });

  for (const service of SERVICES) {
    await prisma.serviceCatalog.upsert({
      where: { id: service.id },
      create: service,
      update: {
        nombre: service.nombre,
        descripcion: service.descripcion,
        precio: service.precio,
        duracionMin: service.duracionMin,
        categoria: service.categoria,
        activo: service.activo,
      },
    });
  }

  for (const part of INVENTORY_PARTS) {
    await prisma.inventoryPart.upsert({
      where: { id: part.id },
      create: part,
      update: {
        codigo: part.codigo,
        nombre: part.nombre,
        categoria: part.categoria,
        stock: part.stock,
        stockMinimo: part.stockMinimo,
        precioUnitario: part.precioUnitario,
        ubicacion: part.ubicacion,
        estado: part.estado,
      },
    });
  }

  for (const commercial of COMMERCIAL_ORDERS) {
    const { lineas, workOrderId, ...commercialData } = commercial;
    await prisma.commercialOrder.upsert({
      where: { id: commercial.id },
      create: {
        ...commercialData,
        lineas: { create: [...lineas] },
      },
      update: {
        numero: commercial.numero,
        tipo: commercial.tipo,
        estado: commercial.estado,
        clientId: commercial.clientId,
        vehicleId: commercial.vehicleId,
        fecha: commercial.fecha,
        validezHasta: commercial.validezHasta,
        subtotal: commercial.subtotal,
        iva: commercial.iva,
        total: commercial.total,
      },
    });

    if (workOrderId) {
      await prisma.workOrder.updateMany({
        where: { id: workOrderId },
        data: { ordenComercialId: commercial.id },
      });
    }
  }

  for (const appointment of APPOINTMENTS) {
    await prisma.appointment.upsert({
      where: { id: appointment.id },
      create: appointment,
      update: {
        clientId: appointment.clientId,
        vehicleId: appointment.vehicleId,
        serviceId: appointment.serviceId,
        fecha: appointment.fecha,
        hora: appointment.hora,
        duracionMin: appointment.duracionMin,
        estado: appointment.estado,
      },
    });
  }

  for (const payment of PAYMENTS) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      create: payment,
      update: {
        commercialOrderId: payment.commercialOrderId,
        monto: payment.monto,
        fecha: payment.fecha,
        metodo: payment.metodo,
        referencia: payment.referencia,
      },
    });
  }

  for (const order of WORK_ORDERS) {
    const { parts, checklist, timeline, ordenComercialId, ...orderData } = order;

    await prisma.workOrder.upsert({
      where: { id: order.id },
      create: {
        ...orderData,
        ordenComercialId: ordenComercialId ?? null,
        partsUsed: {
          create: parts.map((part) => ({
            inventoryPartId: part.inventoryPartId,
            cantidad: part.cantidad,
            precioUnitario: part.precioUnitario,
          })),
        },
        checklist: {
          create: checklist.map((item) => ({
            orden: item.orden,
            item: item.item,
            completado: item.completado,
          })),
        },
        timeline: {
          create: timeline.map((entry) => ({
            fecha: entry.fecha,
            estado: entry.estado,
            nota: entry.nota,
          })),
        },
      },
      update: {
        numero: order.numero,
        tipo: order.tipo,
        clientId: order.clientId,
        vehicleId: order.vehicleId,
        assignedUserId: order.assignedUserId,
        estado: order.estado,
        descripcion: order.descripcion,
        fechaEntrada: order.fechaEntrada,
        fechaEstimada: order.fechaEstimada,
        totalEstimado: order.totalEstimado,
        ordenComercialId: ordenComercialId ?? null,
      },
    });
  }

  const mechanicIds = ['u1', 'u2', 'u3', 'u4'] as const;
  for (const userId of mechanicIds) {
    const ordenesActivas = await prisma.workOrder.count({
      where: {
        assignedUserId: userId,
        estado: { not: 'completado' },
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { ordenesActivas },
    });
  }

  console.log(`Seed completado. Contraseña por defecto: ${DEFAULT_PASSWORD}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
