'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrdenEstadoBadge } from '@/components/shared/status-badge';
import {
  ordenes,
  ordenEstadoLabels,
  getClienteNombre,
  getVehiculoLabel,
  type OrdenEstado,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

const columnas: { estado: OrdenEstado; titulo: string }[] = [
  { estado: 'pendiente', titulo: 'Pendiente' },
  { estado: 'en_progreso', titulo: 'En progreso' },
  { estado: 'esperando_piezas', titulo: 'Esperando piezas' },
  { estado: 'completado', titulo: 'Completado' },
];

export function KanbanBoard() {
  return (
    <div className="grid gap-4 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
      {columnas.map((col) => {
        const items = ordenes.filter((o) => o.estado === col.estado);

        return (
          <div key={col.estado} className="flex min-w-[260px] flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col.titulo}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((orden) => (
                <Link key={orden.id} href={`/mantenimiento/${orden.id}`}>
                  <Card className="cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <CardHeader className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-mono text-sm">{orden.numero}</CardTitle>
                        <OrdenEstadoBadge
                          estado={orden.estado}
                          label={ordenEstadoLabels[orden.estado]}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 px-4 pb-4 pt-0">
                      <p className="text-sm font-medium leading-snug">{orden.descripcion}</p>
                      <p className="text-xs text-muted-foreground">
                        {getClienteNombre(orden.clienteId)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {getVehiculoLabel(orden.vehiculoId)}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatDisplayDate(orden.fechaEstimada)}
                        </span>
                        <span className="font-mono font-semibold">
                          {orden.totalEstimado.toLocaleString('es-ES')} €
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Sin órdenes
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
