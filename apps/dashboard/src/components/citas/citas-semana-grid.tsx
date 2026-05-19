'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CitaEstadoBadge } from '@/components/shared/status-badge';
import {
  formatSemanaDiaLabel,
  getDefaultWeekStart,
  useCitasStore,
} from '@/lib/citas/citas-store';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useServiciosStore } from '@/lib/servicios/servicios-store';
import { citaEstadoLabels, MOCK_TODAY } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatSemanaRango(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startLabel = weekStart.toLocaleDateString('es-ES', opts);
  const endLabel = end.toLocaleDateString('es-ES', { ...opts, year: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

export function CitasSemanaGrid() {
  const { getCitasPorSemana } = useCitasStore();
  const { getClienteNombre } = useClientesStore();
  const { getServicioNombre } = useServiciosStore();
  const [weekStart, setWeekStart] = useState(() => getDefaultWeekStart());

  const citasPorDia = useMemo(
    () => getCitasPorSemana(weekStart),
    [getCitasPorSemana, weekStart]
  );

  const diasSemana = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => toIsoDate(addDays(weekStart, i)));
  }, [weekStart]);

  function handlePrevWeek() {
    setWeekStart((prev) => addDays(prev, -7));
  }

  function handleNextWeek() {
    setWeekStart((prev) => addDays(prev, 7));
  }

  function handleToday() {
    setWeekStart(getDefaultWeekStart());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {formatSemanaRango(weekStart)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={handlePrevWeek}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="min-h-9" onClick={handleToday}>
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={handleNextWeek}
            aria-label="Semana siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 overflow-x-auto md:grid-cols-7">
        {diasSemana.map((iso) => {
          const citasDia = citasPorDia[iso] ?? [];
          const isToday = iso === MOCK_TODAY;

          return (
            <Card key={iso} className={cn('min-w-[140px]', isToday && 'border-primary/50')}>
              <CardHeader className="px-3 py-3">
                <CardTitle
                  className={cn('text-sm font-medium', isToday && 'text-primary')}
                >
                  {formatSemanaDiaLabel(iso)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-3 pb-3">
                {citasDia.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">Sin citas</p>
                ) : (
                  citasDia.map((cita) => (
                    <Link
                      key={cita.id}
                      href={`/citas/${cita.id}`}
                      className={cn(
                        'block rounded-md border border-border p-2 text-xs transition-colors hover:border-primary/40 hover:bg-muted/30',
                        cita.estado === 'confirmada' && 'border-l-2 border-l-primary',
                        cita.estado === 'cancelada' && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-mono font-semibold">{cita.hora}</p>
                        <CitaEstadoBadge
                          estado={cita.estado}
                          label={citaEstadoLabels[cita.estado]}
                        />
                      </div>
                      <p className="mt-1 font-medium leading-tight">
                        {getServicioNombre(cita.servicioId)}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {getClienteNombre(cita.clienteId)}
                      </p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
