import type { CitaFormValues } from '@/lib/mock-data';
import { MOCK_TODAY } from '@/lib/mock-data';

export type CitaFormErrors = Partial<Record<keyof CitaFormValues | 'form', string>>;

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateCitaForm(
  values: CitaFormValues,
  vehiculoBelongsToCliente: boolean
): CitaFormErrors {
  const errors: CitaFormErrors = {};

  if (!values.clienteId) {
    errors.clienteId = 'Selecciona un cliente';
  }

  if (!values.vehiculoId) {
    errors.vehiculoId = 'Selecciona un vehículo';
  } else if (!vehiculoBelongsToCliente) {
    errors.vehiculoId = 'El vehículo no pertenece al cliente seleccionado';
  }

  if (!values.servicioId) {
    errors.servicioId = 'Selecciona un servicio';
  }

  if (!values.fecha) {
    errors.fecha = 'Indica la fecha de la cita';
  } else if (values.fecha < MOCK_TODAY) {
    errors.fecha = 'La fecha no puede ser anterior a hoy';
  }

  if (!values.hora.trim()) {
    errors.hora = 'Indica la hora de la cita';
  } else if (!HORA_REGEX.test(values.hora.trim())) {
    errors.hora = 'Formato de hora no válido (HH:mm)';
  }

  if (!values.duracionMin || values.duracionMin <= 0) {
    errors.duracionMin = 'Selecciona una duración válida';
  }

  return errors;
}

export function hasCitaFormErrors(errors: CitaFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
