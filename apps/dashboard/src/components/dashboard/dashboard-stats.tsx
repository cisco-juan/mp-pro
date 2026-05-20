'use client';

import { useMemo } from 'react';
import { Banknote, Euro, Gauge, Package, Wrench } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CitasHoyStat } from '@/components/citas/citas-hoy-stat';
import { useConfiguracionStore } from '@/lib/configuracion/configuracion-store';
import { useInventarioStore } from '@/lib/inventario/inventario-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import { useTallerStore } from '@/lib/taller/taller-store';
import { MOCK_TODAY } from '@/lib/mock-data';

export function DashboardStats() {
  const { stockBajoCount } = useInventarioStore();
  const { facturasPendientesCount, pagos, getFacturasPendientes } = useOrdenesComercialesStore();
  const { ordenesTrabajo } = useTallerStore();
  const otsAbiertas = useTallerStore().getOrdenesAbiertasCount();
  const { configuracion } = useConfiguracionStore();

  const ingresosMes = useMemo(() => {
    const mes = MOCK_TODAY.slice(0, 7);
    return pagos
      .filter((p) => p.monto > 0 && p.fecha.startsWith(mes))
      .reduce((sum, p) => sum + p.monto, 0);
  }, [pagos]);

  const porCobrar = useMemo(() => {
    return getFacturasPendientes().reduce((sum, f) => sum + f.total, 0);
  }, [getFacturasPendientes]);

  const bahiasOcupadas = useMemo(() => {
    return ordenesTrabajo.filter((o) => o.estado === 'en_progreso').length;
  }, [ordenesTrabajo]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <CitasHoyStat />
      <StatCard
        title="OTs abiertas"
        value={String(otsAbiertas)}
        trend={otsAbiertas > 0 ? 'En curso en taller' : 'Sin trabajos abiertos'}
        icon={Wrench}
        trendPositive={false}
      />
      <StatCard
        title="Stock bajo"
        value={String(stockBajoCount)}
        trend={`${facturasPendientesCount} fact. pend.`}
        icon={Package}
        trendPositive={false}
      />
      <StatCard
        title="Ingresos del mes"
        value={`${ingresosMes.toLocaleString('es-ES')} €`}
        trend="Cobros registrados"
        icon={Euro}
      />
      <StatCard
        title="Por cobrar"
        value={`${porCobrar.toLocaleString('es-ES')} €`}
        trend={`${facturasPendientesCount} factura${facturasPendientesCount !== 1 ? 's' : ''} emitida${facturasPendientesCount !== 1 ? 's' : ''}`}
        icon={Banknote}
        trendPositive={false}
      />
      <StatCard
        title="Bahías ocupadas"
        value={`${bahiasOcupadas} / ${configuracion.bahias}`}
        trend={bahiasOcupadas >= configuracion.bahias ? 'Capacidad máxima' : 'Capacidad disponible'}
        icon={Gauge}
        trendPositive={bahiasOcupadas < configuracion.bahias}
      />
    </div>
  );
}
