/** Nombre del sistema (placeholder fase 1). */
export const APP_NAME = 'MP Pro';

/** Formatea una fecha para visualización en UI. */
export function formatDisplayDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return value.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
