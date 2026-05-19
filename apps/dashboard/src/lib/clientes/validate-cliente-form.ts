import type { ClienteFormValues } from '@/lib/mock-data';

export type ClienteFormErrors = Partial<Record<keyof ClienteFormValues | 'form', string>>;

export function validateClienteForm(
  values: ClienteFormValues,
  mode: 'create' | 'edit'
): ClienteFormErrors {
  const errors: ClienteFormErrors = {};

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  }

  if (!values.email.trim() && !values.telefono.trim()) {
    errors.form = 'Indica al menos un email o teléfono de contacto';
  }

  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Email no válido';
  }

  if (mode === 'create' && values.registrarVehiculo) {
    if (!values.vehiculoMatricula.trim()) {
      errors.vehiculoMatricula = 'La matrícula es obligatoria';
    }
    if (!values.vehiculoMarca.trim()) {
      errors.vehiculoMarca = 'La marca es obligatoria';
    }
    if (!values.vehiculoModelo.trim()) {
      errors.vehiculoModelo = 'El modelo es obligatorio';
    }
  }

  return errors;
}

export function hasFormErrors(errors: ClienteFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
