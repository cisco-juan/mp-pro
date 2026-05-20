import type { Client, Vehicle } from '@org/database';

export type MantenimientoUrgencia = 'ok' | 'proximo' | 'vencido';

export type ClienteDireccionResponse = {
  linea1: string;
  linea2?: string;
  ciudad: string;
  codigoPostal: string;
  provincia?: string;
};

export type ClienteDocumentoResponse = {
  tipo: 'dni' | 'nie' | 'cif' | 'pasaporte';
  numero: string;
};

export type ClienteResponse = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  telefonoSecundario?: string;
  empresa?: string;
  direccion?: ClienteDireccionResponse;
  documento?: ClienteDocumentoResponse;
  estado: 'activo' | 'inactivo';
  vehiculosCount: number;
  ultimaVisita: string;
  notas?: string;
};

export function computeUrgencia(proximoMantenimiento: Date | string): MantenimientoUrgencia {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha =
    proximoMantenimiento instanceof Date
      ? new Date(proximoMantenimiento)
      : new Date(`${proximoMantenimiento}T00:00:00`);
  fecha.setHours(0, 0, 0, 0);
  const diffDias = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias < 0) return 'vencido';
  if (diffDias <= 30) return 'proximo';
  return 'ok';
}

function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mapDireccion(client: Client): ClienteDireccionResponse | undefined {
  if (!client.direccionLinea1 || !client.direccionCiudad || !client.direccionCodigoPostal) {
    return undefined;
  }
  return {
    linea1: client.direccionLinea1,
    linea2: client.direccionLinea2 ?? undefined,
    ciudad: client.direccionCiudad,
    codigoPostal: client.direccionCodigoPostal,
    provincia: client.direccionProvincia ?? undefined,
  };
}

function mapDocumento(client: Client): ClienteDocumentoResponse | undefined {
  if (!client.documentoTipo || !client.documentoNumero) {
    return undefined;
  }
  return {
    tipo: client.documentoTipo,
    numero: client.documentoNumero,
  };
}

export function mapClientToResponse(
  client: Client & { _count?: { vehicles: number } },
): ClienteResponse {
  return {
    id: client.id,
    nombre: client.nombre,
    email: client.email,
    telefono: client.telefono,
    telefonoSecundario: client.telefonoSecundario ?? undefined,
    empresa: client.empresa ?? undefined,
    direccion: mapDireccion(client),
    documento: mapDocumento(client),
    estado: client.estado,
    vehiculosCount: client._count?.vehicles ?? 0,
    ultimaVisita: formatDateOnly(client.ultimaVisita),
    notas: client.notas ?? undefined,
  };
}

export type VehiculoResponse = {
  id: string;
  clienteId: string;
  matricula: string;
  vin?: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  kilometraje: number;
  proximoMantenimiento: string;
  urgencia: MantenimientoUrgencia;
  estado: 'activo' | 'inactivo';
};

export function mapVehicleToResponse(vehicle: Vehicle): VehiculoResponse {
  const v = vehicle as Vehicle & { vin?: string | null };
  return {
    id: v.id,
    clienteId: v.clientId,
    matricula: v.matricula,
    vin: v.vin ?? undefined,
    marca: v.marca,
    modelo: v.modelo,
    anio: v.anio,
    color: v.color,
    kilometraje: v.kilometraje,
    proximoMantenimiento: formatDateOnly(v.proximoMantenimiento),
    urgencia: computeUrgencia(v.proximoMantenimiento),
    estado: v.estado,
  };
}
