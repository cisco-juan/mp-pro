export {
  createPrismaClient,
  disconnectPrisma,
  getPrismaClient,
  PrismaClient,
} from './lib/prisma.js';

export type {
  Client,
  InventoryPart,
  Role,
  User,
  RefreshToken,
  Vehicle,
} from '../generated/prisma/client.js';
export type { Prisma } from '../generated/prisma/client.js';
