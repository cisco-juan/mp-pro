import type {
  WorkOrder,
  WorkOrderChecklistItem,
  WorkOrderPart,
  WorkOrderTimelineEntry,
} from '@org/database';

export type PiezaUsadaResponse = {
  lineId: string;
  piezaId: string;
  cantidad: number;
  precioUnitario: number;
};

export type OrdenTrabajoResponse = {
  id: string;
  numero: string;
  tipo: 'mantenimiento' | 'reparacion';
  clienteId: string;
  vehiculoId: string;
  usuarioId: string;
  estado: 'pendiente' | 'en_progreso' | 'esperando_piezas' | 'completado';
  descripcion: string;
  fechaEntrada: string;
  fechaEstimada: string;
  totalEstimado: number;
  piezasUsadas: PiezaUsadaResponse[];
  ordenComercialId?: string;
  checklist: { item: string; completado: boolean }[];
  timeline: { fecha: string; estado: OrdenTrabajoResponse['estado']; nota: string }[];
};

type WorkOrderWithRelations = WorkOrder & {
  partsUsed: WorkOrderPart[];
  checklist: WorkOrderChecklistItem[];
  timeline: WorkOrderTimelineEntry[];
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTimelineDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function mapWorkOrderToResponse(order: WorkOrderWithRelations): OrdenTrabajoResponse {
  return {
    id: order.id,
    numero: order.numero,
    tipo: order.tipo,
    clienteId: order.clientId,
    vehiculoId: order.vehicleId,
    usuarioId: order.assignedUserId,
    estado: order.estado,
    descripcion: order.descripcion,
    fechaEntrada: formatDateOnly(order.fechaEntrada),
    fechaEstimada: formatDateOnly(order.fechaEstimada),
    totalEstimado: Number(order.totalEstimado),
    piezasUsadas: order.partsUsed.map((part) => ({
      lineId: part.id,
      piezaId: part.inventoryPartId,
      cantidad: part.cantidad,
      precioUnitario: Number(part.precioUnitario),
    })),
    ordenComercialId: order.ordenComercialId ?? undefined,
    checklist: order.checklist
      .sort((a, b) => a.orden - b.orden)
      .map((item) => ({ item: item.item, completado: item.completado })),
    timeline: order.timeline
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .map((entry) => ({
        fecha: formatTimelineDate(entry.fecha),
        estado: entry.estado,
        nota: entry.nota,
      })),
  };
}
