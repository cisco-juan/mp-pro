import { apiRequest } from './client';
import type { OrdenTrabajo } from './types';
import type { OrdenEstado, OrdenTrabajoFormValues, PiezaUsada } from '@/lib/mock-data';

function mapOrdenFormToBody(values: OrdenTrabajoFormValues) {
  return {
    clienteId: values.clienteId,
    vehiculoId: values.vehiculoId,
    usuarioId: values.usuarioId,
    tipo: values.tipo,
    descripcion: values.descripcion,
    fechaEntrada: values.fechaEntrada,
    fechaEstimada: values.fechaEstimada,
  };
}

export async function fetchOrdenesTrabajo(filters?: {
  clientId?: string;
  vehicleId?: string;
  estado?: OrdenEstado;
}): Promise<OrdenTrabajo[]> {
  const params = new URLSearchParams();
  if (filters?.clientId) params.set('clientId', filters.clientId);
  if (filters?.vehicleId) params.set('vehicleId', filters.vehicleId);
  if (filters?.estado) params.set('estado', filters.estado);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<OrdenTrabajo[]>(`/work-orders${query}`);
}

export async function fetchOrdenTrabajo(id: string): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}`);
}

export async function createOrdenTrabajoApi(
  values: OrdenTrabajoFormValues,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>('/work-orders', {
    method: 'POST',
    body: mapOrdenFormToBody(values),
  });
}

export async function updateOrdenTrabajoApi(
  id: string,
  values: OrdenTrabajoFormValues,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}`, {
    method: 'PATCH',
    body: mapOrdenFormToBody(values),
  });
}

export async function updateOrdenEstadoApi(
  id: string,
  estado: OrdenEstado,
  nota?: string,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}/estado`, {
    method: 'PATCH',
    body: { estado, nota },
  });
}

export async function assignMecanicoApi(
  id: string,
  usuarioId: string,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}/assign`, {
    method: 'PATCH',
    body: { usuarioId },
  });
}

export async function linkOrdenComercialApi(
  id: string,
  ordenComercialId: string,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}/link-commercial-order`, {
    method: 'PATCH',
    body: { ordenComercialId },
  });
}

export async function toggleChecklistItemApi(
  id: string,
  index: number,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}/checklist/${index}/toggle`, {
    method: 'PATCH',
  });
}

export async function addPiezaOrdenApi(
  id: string,
  pieza: PiezaUsada,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}/parts`, {
    method: 'POST',
    body: {
      piezaId: pieza.piezaId,
      cantidad: pieza.cantidad,
      precioUnitario: pieza.precioUnitario,
    },
  });
}

export async function removePiezaOrdenApi(
  id: string,
  partLineId: string,
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}/parts/${partLineId}`, {
    method: 'DELETE',
  });
}

export async function setPiezasOrdenApi(
  id: string,
  piezas: PiezaUsada[],
): Promise<OrdenTrabajo> {
  return apiRequest<OrdenTrabajo>(`/work-orders/${id}/parts`, {
    method: 'PUT',
    body: {
      piezas: piezas.map((p) => ({
        piezaId: p.piezaId,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
      })),
    },
  });
}
