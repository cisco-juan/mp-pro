import type { Appointment } from '@org/database';

export type CitaResponse = {
  id: string;
  clienteId: string;
  vehiculoId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapAppointmentToResponse(appointment: Appointment): CitaResponse {
  return {
    id: appointment.id,
    clienteId: appointment.clientId,
    vehiculoId: appointment.vehicleId,
    servicioId: appointment.serviceId,
    fecha: formatDateOnly(appointment.fecha),
    hora: appointment.hora,
    duracionMin: appointment.duracionMin,
    estado: appointment.estado,
    notas: appointment.notas ?? undefined,
  };
}
