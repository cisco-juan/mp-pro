import { apiRequest, getStoredAccessToken } from './client';
import { API_BASE_URL } from './config';
import type { Cliente, Vehiculo } from './types';
import type { ClienteFormValues, VehiculoFormValues } from '@/lib/mock-data';

function mapClienteFormToBody(values: ClienteFormValues) {
  const body: Record<string, unknown> = {
    nombre: values.nombre,
    email: values.email,
    telefono: values.telefono,
    telefonoSecundario: values.telefonoSecundario || undefined,
    empresa: values.empresa || undefined,
    notas: values.notas || undefined,
    documentoTipo: values.documentoTipo || undefined,
    documentoNumero: values.documentoNumero || undefined,
    direccionLinea1: values.direccionLinea1 || undefined,
    direccionLinea2: values.direccionLinea2 || undefined,
    direccionCiudad: values.ciudad || undefined,
    direccionCodigoPostal: values.codigoPostal || undefined,
    direccionProvincia: values.provincia || undefined,
    registrarVehiculo: values.registrarVehiculo,
  };

  if (values.registrarVehiculo) {
    const proximo = new Date();
    proximo.setMonth(proximo.getMonth() + 6);
    body.vehiculo = {
      matricula: values.vehiculoMatricula,
      marca: values.vehiculoMarca,
      modelo: values.vehiculoModelo,
      anio: parseInt(values.vehiculoAnio, 10) || new Date().getFullYear(),
      color: values.vehiculoColor || undefined,
      kilometraje:
        parseInt(values.vehiculoKilometraje.replace(/\D/g, ''), 10) || 0,
      proximoMantenimiento: proximo.toISOString().slice(0, 10),
    };
  }

  return body;
}

function mapClienteUpdateBody(values: ClienteFormValues) {
  return {
    nombre: values.nombre,
    email: values.email,
    telefono: values.telefono,
    telefonoSecundario: values.telefonoSecundario || undefined,
    empresa: values.empresa || undefined,
    notas: values.notas || undefined,
    documentoTipo: values.documentoTipo || undefined,
    documentoNumero: values.documentoNumero || undefined,
    direccionLinea1: values.direccionLinea1 || undefined,
    direccionLinea2: values.direccionLinea2 || undefined,
    direccionCiudad: values.ciudad || undefined,
    direccionCodigoPostal: values.codigoPostal || undefined,
    direccionProvincia: values.provincia || undefined,
  };
}

function mapVehiculoFormToBody(values: VehiculoFormValues) {
  return {
    clientId: values.clienteId,
    matricula: values.matricula,
    marca: values.marca,
    modelo: values.modelo,
    anio: parseInt(values.anio, 10) || new Date().getFullYear(),
    color: values.color || undefined,
    kilometraje: parseInt(values.kilometraje.replace(/\D/g, ''), 10) || 0,
    proximoMantenimiento: values.proximoMantenimiento,
  };
}

export async function fetchClientes(): Promise<Cliente[]> {
  return apiRequest<Cliente[]>('/clients');
}

export async function fetchVehiculos(clientId?: string): Promise<Vehiculo[]> {
  const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
  return apiRequest<Vehiculo[]>(`/vehicles${query}`);
}

export async function createClienteApi(values: ClienteFormValues): Promise<Cliente> {
  return apiRequest<Cliente>('/clients', {
    method: 'POST',
    body: mapClienteFormToBody(values),
  });
}

export async function updateClienteApi(
  id: string,
  values: ClienteFormValues,
): Promise<Cliente> {
  return apiRequest<Cliente>(`/clients/${id}`, {
    method: 'PATCH',
    body: mapClienteUpdateBody(values),
  });
}

export async function toggleClienteActivoApi(id: string): Promise<Cliente> {
  return apiRequest<Cliente>(`/clients/${id}/toggle-active`, {
    method: 'PATCH',
  });
}

export async function createVehiculoApi(values: VehiculoFormValues): Promise<Vehiculo> {
  return apiRequest<Vehiculo>('/vehicles', {
    method: 'POST',
    body: mapVehiculoFormToBody(values),
  });
}

export async function updateVehiculoApi(
  id: string,
  values: VehiculoFormValues,
): Promise<Vehiculo> {
  return apiRequest<Vehiculo>(`/vehicles/${id}`, {
    method: 'PATCH',
    body: mapVehiculoFormToBody(values),
  });
}

export async function toggleVehiculoActivoApi(id: string): Promise<Vehiculo> {
  return apiRequest<Vehiculo>(`/vehicles/${id}/toggle-active`, {
    method: 'PATCH',
  });
}

export async function exportClientesCsv(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/clients/export/csv`, {
    headers: { Authorization: `Bearer ${getStoredAccessToken() ?? ''}` },
  });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clientes.csv';
  a.click();
  URL.revokeObjectURL(url);
}
