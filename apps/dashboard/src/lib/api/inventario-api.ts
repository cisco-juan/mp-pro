import { apiRequest } from './client';
import type { Pieza } from './types';
import type { PiezaFormValues } from '@/lib/mock-data';

function mapPiezaFormToBody(values: PiezaFormValues) {
  return {
    codigo: values.codigo,
    nombre: values.nombre,
    categoria: values.categoria,
    stock: parseInt(values.stock, 10) || 0,
    stockMinimo: parseInt(values.stockMinimo, 10) || 0,
    precioUnitario: parseFloat(values.precioUnitario) || 0,
    ubicacion: values.ubicacion || undefined,
  };
}

export async function fetchPiezas(categoria?: string): Promise<Pieza[]> {
  const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : '';
  return apiRequest<Pieza[]>(`/inventory/parts${query}`);
}

export async function fetchPieza(id: string): Promise<Pieza> {
  return apiRequest<Pieza>(`/inventory/parts/${id}`);
}

export async function createPiezaApi(values: PiezaFormValues): Promise<Pieza> {
  return apiRequest<Pieza>('/inventory/parts', {
    method: 'POST',
    body: mapPiezaFormToBody(values),
  });
}

export async function updatePiezaApi(
  id: string,
  values: PiezaFormValues,
): Promise<Pieza> {
  return apiRequest<Pieza>(`/inventory/parts/${id}`, {
    method: 'PATCH',
    body: mapPiezaFormToBody(values),
  });
}

export async function adjustStockApi(id: string, delta: number): Promise<Pieza> {
  return apiRequest<Pieza>(`/inventory/parts/${id}/adjust-stock`, {
    method: 'PATCH',
    body: { delta },
  });
}

export async function reserveStockApi(id: string, cantidad: number): Promise<Pieza> {
  return apiRequest<Pieza>(`/inventory/parts/${id}/reserve`, {
    method: 'POST',
    body: { cantidad },
  });
}
