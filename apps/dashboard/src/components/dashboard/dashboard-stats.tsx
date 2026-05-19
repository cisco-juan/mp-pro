'use client';

import { Euro, Package, Wrench } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CitasHoyStat } from '@/components/citas/citas-hoy-stat';
import { useMemo } from 'react';
import { useInventarioStore } from '@/lib/inventario/inventario-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import { useTallerStore } from '@/lib/taller/taller-store';
import { MOCK_TODAY } from '@/lib/mock-data';

export function DashboardStats() {
  const { stockBajoCount } = useInventarioStore();
  const { facturasPendientesCount, pagos } = useOrdenesComercialesStore();
  const otsAbiertas = useTallerStore().getOrdenesAbiertasCount();

  const ingresosMes = useMemo(() => {
    const mes = MOCK_TODAY.slice(0, 7);
    return pagos
      .filter((p) => p.monto > 0 && p.fecha.startsWith(mes))
      .reduce((sum, p) => sum + p.monto, 0);
  }, [pagos]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </div>
  );
}
