'use client';

import { Euro, Package, Wrench } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CitasHoyStat } from '@/components/citas/citas-hoy-stat';
import { useInventarioStore } from '@/lib/inventario/inventario-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import { useTallerStore } from '@/lib/taller/taller-store';
import { dashboardStats } from '@/lib/mock-data';

export function DashboardStats() {
  const { stockBajoCount } = useInventarioStore();
  const { facturasPendientesCount } = useOrdenesComercialesStore();
  const otsAbiertas = useTallerStore().getOrdenesAbiertasCount();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CitasHoyStat />
      <StatCard
        title="OTs abiertas"
        value={String(otsAbiertas)}
        trend={dashboardStats.otsAbiertasTrend}
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
        value={`${dashboardStats.ingresosMes.toLocaleString('es-ES')} €`}
        trend={dashboardStats.ingresosTrend}
        icon={Euro}
      />
    </div>
  );
}
