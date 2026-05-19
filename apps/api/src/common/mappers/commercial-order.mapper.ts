import type { CommercialOrder, CommercialOrderLine, WorkOrder } from '@org/database';

export type LineaOrdenResponse = {
  id: string;
  tipo: 'servicio' | 'pieza';
  referenciaId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type OrdenComercialResponse = {
  id: string;
  numero: string;
  tipo: 'cotizacion' | 'factura';
  estado: string;
  clienteId: string;
  vehiculoId?: string;
  ordenTrabajoId?: string;
  fecha: string;
  validezHasta?: string;
  lineas: LineaOrdenResponse[];
  subtotal: number;
  iva: number;
  total: number;
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mapLine(line: CommercialOrderLine): LineaOrdenResponse {
  return {
    id: line.id,
    tipo: line.tipo,
    referenciaId: line.referenciaId,
    descripcion: line.descripcion,
    cantidad: line.cantidad,
    precioUnitario: Number(line.precioUnitario),
    subtotal: Number(line.subtotal),
  };
}

type CommercialOrderWithRelations = CommercialOrder & {
  lineas: CommercialOrderLine[];
  workOrders?: Pick<WorkOrder, 'id'>[];
};

export function mapCommercialOrderToResponse(
  order: CommercialOrderWithRelations,
): OrdenComercialResponse {
  return {
    id: order.id,
    numero: order.numero,
    tipo: order.tipo,
    estado: order.estado,
    clienteId: order.clientId,
    vehiculoId: order.vehicleId ?? undefined,
    ordenTrabajoId: order.workOrders?.[0]?.id,
    fecha: formatDateOnly(order.fecha),
    validezHasta: order.validezHasta ? formatDateOnly(order.validezHasta) : undefined,
    lineas: order.lineas
      .sort((a: CommercialOrderLine, b: CommercialOrderLine) => a.orden - b.orden)
      .map(mapLine),
    subtotal: Number(order.subtotal),
    iva: Number(order.iva),
    total: Number(order.total),
  };
}
