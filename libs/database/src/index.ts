export {
  createPrismaClient,
  disconnectPrisma,
  getPrismaClient,
  PrismaClient,
} from './lib/prisma.js';

export type { Role, User, RefreshToken } from '../generated/prisma/client.js';
