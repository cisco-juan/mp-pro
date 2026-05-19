/** Nombre del sistema (placeholder fase 1). */
export const APP_NAME = 'MP Pro';

/** Formatea una fecha para visualización en UI. */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
