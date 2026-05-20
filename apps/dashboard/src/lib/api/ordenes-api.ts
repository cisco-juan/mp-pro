import { apiRequest } from './client';
import type {
  CotizacionEstado,
  FacturaEstado,
  LineaOrden,
  LineaOrdenTipo,
  OrdenComercialEstado,
  OrdenComercialTipo,
} from '@/lib/mock-data';

export type OrdenComercial = {
  id: string;
  numero: string;
  tipo: OrdenComercialTipo;
  estado: OrdenComercialEstado;
  clienteId: string;
  vehiculoId?: string;
  ordenTrabajoId?: string;
  fecha: string;
  validezHasta?: string;
  lineas: LineaOrden[];
  subtotal: number;
  iva: number;
  total: number;
};

export async function fetchOrdenesComerciales(params?: {
  clientId?: string;
  tipo?: OrdenComercialTipo;
  estado?: string;
}): Promise<OrdenComercial[]> {
  const search = new URLSearchParams();
  if (params?.clientId) search.set('clientId', params.clientId);
  if (params?.tipo) search.set('tipo', params.tipo);
  if (params?.estado) search.set('estado', params.estado);
  const query = search.toString();
  return apiRequest<OrdenComercial[]>(`/commercial-orders${query ? `?${query}` : ''}`);
}

export async function createCotizacionFromWorkOrderApi(
  ordenTrabajoId: string,
): Promise<OrdenComercial> {
  return apiRequest<OrdenComercial>('/commercial-orders/from-work-order', {
    method: 'POST',
    body: { ordenTrabajoId },
  });
}

export async function updateCotizacionEstadoApi(
  id: string,
  estado: CotizacionEstado,
): Promise<OrdenComercial> {
  return apiRequest<OrdenComercial>(`/commercial-orders/${id}/estado`, {
    method: 'PATCH',
    body: { estado },
  });
}

export async function updateFacturaEstadoApi(
  id: string,
  estado: FacturaEstado,
): Promise<OrdenComercial> {
  return apiRequest<OrdenComercial>(`/commercial-orders/${id}/estado`, {
    method: 'PATCH',
    body: { estado },
  });
}

export async function convertCotizacionToFacturaApi(
  cotizacionId: string,
): Promise<OrdenComercial> {
  return apiRequest<OrdenComercial>(`/commercial-orders/${cotizacionId}/convert-to-invoice`, {
    method: 'POST',
  });
}

export interface CreateCotizacionLineInput {
  tipo: LineaOrdenTipo;
  referenciaId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CreateCotizacionInput {
  clienteId: string;
  vehiculoId?: string;
  fecha: string;
  validezHasta?: string;
  lineas: CreateCotizacionLineInput[];
}

export async function createCotizacionApi(
  input: CreateCotizacionInput,
): Promise<OrdenComercial> {
  return apiRequest<OrdenComercial>('/commercial-orders', {
    method: 'POST',
    body: {
      tipo: 'cotizacion',
      clienteId: input.clienteId,
      vehiculoId: input.vehiculoId || undefined,
      fecha: input.fecha,
      validezHasta: input.validezHasta || undefined,
      lineas: input.lineas,
    },
  });
}
