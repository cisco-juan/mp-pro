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
  WorkOrder,
  WorkOrderChecklistItem,
  WorkOrderPart,
  WorkOrderTimelineEntry,
  WorkOrderEstado,
  WorkOrderTipo,
} from '../generated/prisma/client.js';
export type { Prisma } from '../generated/prisma/client.js';
