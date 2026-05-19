import type { VehiculoFormValues } from '@/lib/mock-data';

export type VehiculoFormErrors = Partial<Record<keyof VehiculoFormValues | 'form', string>>;

export function validateVehiculoForm(
  values: VehiculoFormValues,
  existingMatriculas: string[],
  excludeMatricula?: string
): VehiculoFormErrors {
  const errors: VehiculoFormErrors = {};

  if (!values.clienteId.trim()) {
    errors.clienteId = 'Selecciona un cliente';
  }

  const matricula = values.matricula.trim().toUpperCase();
  if (!matricula) {
    errors.matricula = 'La matrícula es obligatoria';
  } else if (
    existingMatriculas.some(
      (m) =>
        m.toUpperCase() === matricula &&
        m.toUpperCase() !== (excludeMatricula?.toUpperCase() ?? '')
    )
  ) {
    errors.matricula = 'Ya existe un vehículo con esta matrícula';
  }

  if (!values.marca.trim()) {
    errors.marca = 'La marca es obligatoria';
  }

  if (!values.modelo.trim()) {
    errors.modelo = 'El modelo es obligatorio';
  }

  const anio = parseInt(values.anio, 10);
  if (!values.anio.trim() || Number.isNaN(anio)) {
    errors.anio = 'Introduce un año válido';
  } else if (anio < 1980 || anio > new Date().getFullYear() + 1) {
    errors.anio = 'Año fuera de rango';
  }

  if (!values.proximoMantenimiento) {
    errors.proximoMantenimiento = 'Indica la fecha del próximo mantenimiento';
  }

  const km = parseInt(values.kilometraje.replace(/\D/g, ''), 10);
  if (values.kilometraje.trim() && (Number.isNaN(km) || km < 0)) {
    errors.kilometraje = 'Kilometraje no válido';
  }

  return errors;
}

export function hasVehiculoFormErrors(errors: VehiculoFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
