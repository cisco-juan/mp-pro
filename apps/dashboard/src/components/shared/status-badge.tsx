import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CitaEstado, MantenimientoUrgencia, OrdenEstado } from '@/lib/mock-data';

const citaVariants: Record<CitaEstado, string> = {
  pendiente: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  confirmada: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  completada: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  cancelada: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
};

const ordenVariants: Record<OrdenEstado, string> = {
  pendiente: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  en_progreso: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  esperando_piezas: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  completado: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
};

const urgenciaVariants: Record<MantenimientoUrgencia, string> = {
  ok: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  proximo: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  vencido: 'bg-red-100 text-red-800 hover:bg-red-100',
};

const urgenciaLabels: Record<MantenimientoUrgencia, string> = {
  ok: 'Al día',
  proximo: 'Próximo',
  vencido: 'Vencido',
};

export function CitaEstadoBadge({
  estado,
  label,
}: {
  estado: CitaEstado;
  label: string;
}) {
  return (
    <Badge variant="secondary" className={cn(citaVariants[estado])}>
      {label}
    </Badge>
  );
}

export function OrdenEstadoBadge({
  estado,
  label,
}: {
  estado: OrdenEstado;
  label: string;
}) {
  return (
    <Badge variant="secondary" className={cn(ordenVariants[estado])}>
      {label}
    </Badge>
  );
}

export function UrgenciaBadge({ urgencia }: { urgencia: MantenimientoUrgencia }) {
  return (
    <Badge variant="secondary" className={cn(urgenciaVariants[urgencia])}>
      {urgenciaLabels[urgencia]}
    </Badge>
  );
}

export function ClienteEstadoBadge({
  activo,
}: {
  activo: boolean;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        activo
          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
      )}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}
