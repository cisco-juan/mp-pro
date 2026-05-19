import { apiRequest } from './client';
import type { CitaEstado, CitaFormValues } from '@/lib/mock-data';

export type Cita = {
  id: string;
  clienteId: string;
  vehiculoId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  estado: CitaEstado;
  notas?: string;
};

export async function fetchCitas(params?: {
  clientId?: string;
  vehicleId?: string;
  fecha?: string;
}): Promise<Cita[]> {
  const search = new URLSearchParams();
  if (params?.clientId) search.set('clientId', params.clientId);
  if (params?.vehicleId) search.set('vehicleId', params.vehicleId);
  if (params?.fecha) search.set('fecha', params.fecha);
  const query = search.toString();
  return apiRequest<Cita[]>(`/appointments${query ? `?${query}` : ''}`);
}

export async function createCitaApi(values: CitaFormValues): Promise<Cita> {
  return apiRequest<Cita>('/appointments', {
    method: 'POST',
    body: {
      clienteId: values.clienteId,
      vehiculoId: values.vehiculoId,
      servicioId: values.servicioId,
      fecha: values.fecha,
      hora: values.hora,
      duracionMin: values.duracionMin,
      notas: values.notas || undefined,
    },
  });
}

export async function updateCitaApi(id: string, values: CitaFormValues): Promise<Cita> {
  return apiRequest<Cita>(`/appointments/${id}`, {
    method: 'PATCH',
    body: {
      clienteId: values.clienteId,
      vehiculoId: values.vehiculoId,
      servicioId: values.servicioId,
      fecha: values.fecha,
      hora: values.hora,
      duracionMin: values.duracionMin,
      notas: values.notas || undefined,
    },
  });
}

export async function updateCitaEstadoApi(id: string, estado: CitaEstado): Promise<Cita> {
  return apiRequest<Cita>(`/appointments/${id}/estado`, {
    method: 'PATCH',
    body: { estado },
  });
}
