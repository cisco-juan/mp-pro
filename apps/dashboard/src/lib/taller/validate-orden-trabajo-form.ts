import type { OrdenTrabajoFormValues } from '@/lib/mock-data';

export type OrdenTrabajoFormErrors = Partial<
  Record<keyof OrdenTrabajoFormValues | 'form', string>
>;

export function validateOrdenTrabajoForm(
  values: OrdenTrabajoFormValues,
  vehiculoBelongsToCliente: boolean
): OrdenTrabajoFormErrors {
  const errors: OrdenTrabajoFormErrors = {};

  if (!values.clienteId) {
    errors.clienteId = 'Selecciona un cliente';
  }

  if (!values.vehiculoId) {
    errors.vehiculoId = 'Selecciona un vehículo';
  } else if (!vehiculoBelongsToCliente) {
    errors.vehiculoId = 'El vehículo no pertenece al cliente seleccionado';
  }

  if (!values.usuarioId) {
    errors.usuarioId = 'Selecciona un mecánico';
  }

  if (!values.descripcion.trim()) {
    errors.descripcion = 'Indica la descripción del trabajo';
  }

  if (!values.fechaEntrada) {
    errors.fechaEntrada = 'Indica la fecha de entrada';
  }

  if (!values.fechaEstimada) {
    errors.fechaEstimada = 'Indica la fecha estimada de entrega';
  } else if (values.fechaEntrada && values.fechaEstimada < values.fechaEntrada) {
    errors.fechaEstimada = 'La fecha estimada no puede ser anterior a la de entrada';
  }

  return errors;
}

export function hasOrdenTrabajoFormErrors(errors: OrdenTrabajoFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
