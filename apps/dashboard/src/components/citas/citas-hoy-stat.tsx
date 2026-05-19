'use client';

import { Calendar } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { useCitasStore } from '@/lib/citas/citas-store';

export function CitasHoyStat() {
  const { getCitasHoy } = useCitasStore();
  const citasHoy = getCitasHoy();
  const pendientes = citasHoy.filter((c) => c.estado === 'pendiente').length;
  const trend = pendientes > 0 ? `${pendientes} pend.` : 'Al día';

  return (
    <StatCard
      title="Citas hoy"
      value={String(citasHoy.length)}
      trend={trend}
      icon={Calendar}
    />
  );
}
