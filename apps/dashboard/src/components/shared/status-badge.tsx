import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  garantiaEstadoLabels,
  type CitaEstado,
  type CotizacionEstado,
  type FacturaEstado,
  type GarantiaEstado,
  type MantenimientoUrgencia,
  type OrdenComercialEstado,
  type OrdenComercialTipo,
  type OrdenEstado,
  type OrdenTrabajoTipo,
  type PagoMetodo,
} from '@/lib/mock-data';

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

const ordenTrabajoTipoVariants: Record<OrdenTrabajoTipo, string> = {
  mantenimiento: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  reparacion: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
};

const ordenComercialTipoVariants: Record<OrdenComercialTipo, string> = {
  cotizacion: 'bg-violet-100 text-violet-800 hover:bg-violet-100',
  factura: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
};

const cotizacionEstadoVariants: Record<CotizacionEstado, string> = {
  borrador: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  enviada: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  aceptada: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  rechazada: 'bg-red-100 text-red-800 hover:bg-red-100',
  convertida: 'bg-violet-100 text-violet-800 hover:bg-violet-100',
};

const facturaEstadoVariants: Record<FacturaEstado, string> = {
  borrador: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  emitida: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  pagada: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  vencida: 'bg-red-100 text-red-800 hover:bg-red-100',
  anulada: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
};

const pagoMetodoVariants: Record<PagoMetodo, string> = {
  efectivo: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  tarjeta: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  transferencia: 'bg-violet-100 text-violet-800 hover:bg-violet-100',
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

export function OrdenTrabajoTipoBadge({
  tipo,
  label,
}: {
  tipo: OrdenTrabajoTipo;
  label: string;
}) {
  return (
    <Badge variant="secondary" className={cn(ordenTrabajoTipoVariants[tipo])}>
      {label}
    </Badge>
  );
}

export function OrdenComercialTipoBadge({
  tipo,
  label,
}: {
  tipo: OrdenComercialTipo;
  label: string;
}) {
  return (
    <Badge variant="secondary" className={cn(ordenComercialTipoVariants[tipo])}>
      {label}
    </Badge>
  );
}

export function OrdenComercialEstadoBadge({
  tipo,
  estado,
  label,
}: {
  tipo: OrdenComercialTipo;
  estado: OrdenComercialEstado;
  label: string;
}) {
  const variant =
    tipo === 'cotizacion'
      ? cotizacionEstadoVariants[estado as CotizacionEstado]
      : facturaEstadoVariants[estado as FacturaEstado];

  return (
    <Badge variant="secondary" className={cn(variant)}>
      {label}
    </Badge>
  );
}

export function PagoMetodoBadge({
  metodo,
  label,
}: {
  metodo: PagoMetodo;
  label: string;
}) {
  return (
    <Badge variant="secondary" className={cn(pagoMetodoVariants[metodo])}>
      {label}
    </Badge>
  );
}

export function StockBadge({ stockBajo }: { stockBajo: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        stockBajo
          ? 'bg-red-100 text-red-800 hover:bg-red-100'
          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
      )}
    >
      {stockBajo ? 'Stock bajo' : 'OK'}
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

const garantiaEstadoVariants: Record<GarantiaEstado, string> = {
  vigente: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  vencida: 'bg-red-100 text-red-800 hover:bg-red-100',
  anulada: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
};

export function GarantiaEstadoBadge({
  estado,
}: {
  estado: GarantiaEstado;
}) {
  return (
    <Badge variant="secondary" className={cn(garantiaEstadoVariants[estado])}>
      {garantiaEstadoLabels[estado]}
    </Badge>
  );
}

export function VehiculoEstadoBadge({ activo }: { activo: boolean }) {
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

export function ActivoBadge({ activo }: { activo: boolean }) {
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
