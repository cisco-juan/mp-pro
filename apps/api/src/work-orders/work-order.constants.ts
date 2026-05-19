import type { WorkOrderTipo } from '@org/database';

export const WORK_ORDER_CHECKLIST_TEMPLATES: Record<WorkOrderTipo, string[]> = {
  mantenimiento: [
    'Confirmar piezas en stock',
    'Reservar bahía',
    'Cambio aceite',
    'Filtros',
    'Revisión general',
    'Prueba en banco',
  ],
  reparacion: [
    'Diagnóstico inicial',
    'Desmontaje',
    'Sustitución / reparación',
    'Montaje',
    'Prueba en banco',
  ],
};
