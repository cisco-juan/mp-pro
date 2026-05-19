'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CitaEstadoBadge } from '@/components/shared/status-badge';
import { useCitasStore } from '@/lib/citas/citas-store';
import { citaEstadoLabels, getClienteNombre, getServicioNombre } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

export function ProximasCitasCard() {
  const { citas } = useCitasStore();

  const proximasCitas = citas
    .filter((c) => c.estado !== 'completada' && c.estado !== 'cancelada')
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas citas</CardTitle>
        <CardDescription>Agenda de hoy y próximos días</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {proximasCitas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay citas próximas</p>
        ) : (
          proximasCitas.map((cita) => (
            <Link
              key={cita.id}
              href={`/citas/${cita.id}`}
              className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{cita.hora}</span>
                  <CitaEstadoBadge
                    estado={cita.estado}
                    label={citaEstadoLabels[cita.estado]}
                  />
                </div>
                <p className="text-sm font-medium">{getServicioNombre(cita.servicioId)}</p>
                <p className="text-xs text-muted-foreground">
                  {getClienteNombre(cita.clienteId)} · {formatDisplayDate(cita.fecha)}
                </p>
              </div>
            </Link>
          ))
        )}
        <Button variant="outline" asChild className="min-h-10">
          <Link href="/citas">
            Ver todas las citas
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
