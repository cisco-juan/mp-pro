import { apiRequest } from './client';
import type { ServicioFormValues } from '@/lib/mock-data';

export type Servicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  categoria: string;
  activo: boolean;
};

export async function fetchServicios(activosOnly = false): Promise<Servicio[]> {
  const query = activosOnly ? '?activos=true' : '';
  return apiRequest<Servicio[]>(`/services${query}`);
}

export async function createServicioApi(values: ServicioFormValues): Promise<Servicio> {
  return apiRequest<Servicio>('/services', {
    method: 'POST',
    body: {
      nombre: values.nombre,
      descripcion: values.descripcion,
      precio: parseFloat(values.precio) || 0,
      duracionMin: parseInt(values.duracionMin, 10) || 60,
      categoria: values.categoria,
    },
  });
}

export async function updateServicioApi(
  id: string,
  values: ServicioFormValues,
): Promise<Servicio> {
  return apiRequest<Servicio>(`/services/${id}`, {
    method: 'PATCH',
    body: {
      nombre: values.nombre,
      descripcion: values.descripcion,
      precio: parseFloat(values.precio) || 0,
      duracionMin: parseInt(values.duracionMin, 10) || 60,
      categoria: values.categoria,
    },
  });
}

export async function toggleServicioActivoApi(id: string): Promise<Servicio> {
  return apiRequest<Servicio>(`/services/${id}/toggle-active`, { method: 'PATCH' });
}
