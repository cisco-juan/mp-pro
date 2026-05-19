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

  console.log(`Seed completado. Contraseña por defecto: ${DEFAULT_PASSWORD}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
