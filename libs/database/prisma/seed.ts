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
      'pagos:write',
      'usuarios:write',
      'inventario:write',
      'clientes:write',
      'clientes:read',
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
    permisos: ['citas:write', 'clientes:write', 'ordenes:write', 'pagos:read'],
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

  console.log(`Seed completado. Contraseña por defecto: ${DEFAULT_PASSWORD}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
