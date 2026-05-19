export {
  createPrismaClient,
  disconnectPrisma,
  getPrismaClient,
  PrismaClient,
} from './lib/prisma.js';

export type {
  Appointment,
  Client,
  CommercialOrder,
  CommercialOrderLine,
  InventoryPart,
  Payment,
  Role,
  ServiceCatalog,
  User,
  RefreshToken,
  Vehicle,
  WorkOrder,
  WorkOrderChecklistItem,
  WorkOrderPart,
  WorkOrderTimelineEntry,
  WorkshopSettings,
  WorkOrderEstado,
  WorkOrderTipo,
} from '../generated/prisma/client.js';
export type { Prisma } from '../generated/prisma/client.js';
