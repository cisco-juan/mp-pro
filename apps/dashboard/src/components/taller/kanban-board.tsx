'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  OrdenTrabajoTipoBadge,
} from '@/components/shared/status-badge';
import {
  ordenesTrabajo,
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
  getClienteNombre,
  getVehiculoLabel,
  getUsuarioById,
  type OrdenEstado,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';
import { cn } from '@/lib/utils';

const columnas: { estado: OrdenEstado; titulo: string; columnClass: string }[] = [
  {
    estado: 'pendiente',
    titulo: 'Pendiente',
    columnClass: 'bg-slate-100/80',
  },
  {
    estado: 'en_progreso',
    titulo: 'En progreso',
    columnClass: 'bg-blue-50/80',
  },
  {
    estado: 'esperando_piezas',
    titulo: 'Esperando piezas',
    columnClass: 'bg-amber-50/80',
  },
  {
    estado: 'completado',
    titulo: 'Completado',
    columnClass: 'bg-emerald-50/80',
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getChecklistProgress(checklist: { completado: boolean }[]) {
  if (checklist.length === 0) return 0;
  const done = checklist.filter((item) => item.completado).length;
  return Math.round((done / checklist.length) * 100);
}

export function KanbanBoard() {
  return (
    <div className="max-w-full overflow-x-auto pb-2">
      <div className="flex snap-x snap-mandatory gap-4 md:grid md:grid-cols-2 md:snap-none xl:grid-cols-4">
        {columnas.map((col) => {
          const items = ordenesTrabajo.filter((o) => o.estado === col.estado);

          return (
            <div
              key={col.estado}
              className={cn(
                'flex min-h-[400px] min-w-[280px] snap-start flex-col gap-3 rounded-xl p-3',
                col.columnClass
              )}
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{col.titulo}</h3>
                <span className="rounded-full bg-background/80 px-2 py-0.5 font-mono text-xs shadow-sm">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {items.map((orden) => {
                  const mecanico = getUsuarioById(orden.usuarioId);
                  const progress = getChecklistProgress(orden.checklist);

                  return (
                    <Link key={orden.id} href={`/taller/${orden.id}`}>
                      <Card className="cursor-pointer border-border/60 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-lg">
                        <CardHeader className="border-b border-border/60 px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="font-mono text-sm">{orden.numero}</CardTitle>
                            <OrdenTrabajoTipoBadge
                              tipo={orden.tipo}
                              label={ordenTrabajoTipoLabels[orden.tipo]}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-3">
                          <p className="text-sm font-medium leading-snug">{orden.descripcion}</p>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {getClienteNombre(orden.clienteId)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {getVehiculoLabel(orden.vehiculoId)}
                            </p>
                          </div>
                          {mecanico && (
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                                  {getInitials(mecanico.nombre)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-xs text-muted-foreground">
                                {mecanico.nombre}
                              </span>
                            </div>
                          )}
                          {orden.checklist.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Checklist</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {formatDisplayDate(orden.fechaEstimada)}
                            </span>
                            <span className="font-mono text-sm font-semibold">
                              {orden.totalEstimado.toLocaleString('es-ES')} €
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
                {items.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center text-sm text-muted-foreground">
                    Sin trabajos en {ordenEstadoLabels[col.estado].toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
