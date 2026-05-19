'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OrdenTrabajoTipoBadge } from '@/components/shared/status-badge';
import {
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
  type OrdenEstado,
  type OrdenTrabajo,
} from '@/lib/mock-data';
import { useTallerStore } from '@/lib/taller/taller-store';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useUsuariosStore } from '@/lib/usuarios/usuarios-store';
import { formatDisplayDate } from '@org/utils-shared';
import { cn } from '@/lib/utils';

const columnas: { estado: OrdenEstado; titulo: string; columnClass: string }[] = [
  { estado: 'pendiente', titulo: 'Pendiente', columnClass: 'bg-slate-100/80' },
  { estado: 'en_progreso', titulo: 'En progreso', columnClass: 'bg-blue-50/80' },
  { estado: 'esperando_piezas', titulo: 'Esperando piezas', columnClass: 'bg-amber-50/80' },
  { estado: 'completado', titulo: 'Completado', columnClass: 'bg-emerald-50/80' },
];

const ESTADOS_SET = new Set<string>(columnas.map((c) => c.estado));

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

function OrdenKanbanCardContent({
  orden,
  getVehiculoLabel,
  isDragging,
}: {
  orden: OrdenTrabajo;
  getVehiculoLabel: (id: string) => string;
  isDragging?: boolean;
}) {
  const { getClienteNombre } = useClientesStore();
  const { getUsuario } = useUsuariosStore();
  const mecanico = orden.usuarioId ? getUsuario(orden.usuarioId) : undefined;
  const progress = getChecklistProgress(orden.checklist);

  return (
    <Card
      className={cn(
        'border-border/60 bg-card transition-all duration-200',
        isDragging
          ? 'rotate-1 shadow-xl ring-2 ring-primary/30'
          : 'hover:border-primary/40 hover:shadow-lg'
      )}
    >
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
          <p className="text-xs text-muted-foreground">{getClienteNombre(orden.clienteId)}</p>
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
            <span className="truncate text-xs text-muted-foreground">{mecanico.nombre}</span>
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
          <span className="text-muted-foreground">{formatDisplayDate(orden.fechaEstimada)}</span>
          <span className="font-mono text-sm font-semibold">
            {orden.totalEstimado.toLocaleString('es-ES')} €
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function DraggableOrdenCard({
  orden,
  getVehiculoLabel,
}: {
  orden: OrdenTrabajo;
  getVehiculoLabel: (id: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: orden.id,
    data: { orden },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <Link href={`/taller/${orden.id}`} onClick={(e) => isDragging && e.preventDefault()}>
          <OrdenKanbanCardContent orden={orden} getVehiculoLabel={getVehiculoLabel} />
        </Link>
      </div>
    </div>
  );
}

function KanbanColumn({
  estado,
  titulo,
  columnClass,
  ordenes,
  getVehiculoLabel,
}: {
  estado: OrdenEstado;
  titulo: string;
  columnClass: string;
  ordenes: OrdenTrabajo[];
  getVehiculoLabel: (id: string) => string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[400px] min-w-[280px] snap-start flex-col gap-3 rounded-xl p-3 transition-colors',
        columnClass,
        isOver && 'ring-2 ring-primary/40'
      )}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{titulo}</h3>
        <span className="rounded-full bg-background/80 px-2 py-0.5 font-mono text-xs shadow-sm">
          {ordenes.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {ordenes.map((orden) => (
          <DraggableOrdenCard key={orden.id} orden={orden} getVehiculoLabel={getVehiculoLabel} />
        ))}
        {ordenes.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center text-sm text-muted-foreground">
            Sin trabajos en {ordenEstadoLabels[estado].toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { ordenesTrabajo, updateOrdenEstado, getOrdenTrabajo } = useTallerStore();
  const { getVehiculoLabel } = useClientesStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeOrden = activeId ? getOrdenTrabajo(activeId) : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const ordenId = String(active.id);
    const overId = String(over.id);

    if (!ESTADOS_SET.has(overId)) return;

    const newEstado = overId as OrdenEstado;
    const orden = getOrdenTrabajo(ordenId);
    if (!orden || orden.estado === newEstado) return;

    const ok = updateOrdenEstado(ordenId, newEstado);
    if (ok) {
      toast.success(`OT movida a ${ordenEstadoLabels[newEstado].toLowerCase()}`);
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="max-w-full overflow-x-auto pb-2">
        <div className="flex snap-x snap-mandatory gap-4 md:grid md:grid-cols-2 md:snap-none xl:grid-cols-4">
          {columnas.map((col) => {
            const items = ordenesTrabajo.filter((o) => o.estado === col.estado);
            return (
              <KanbanColumn
                key={col.estado}
                estado={col.estado}
                titulo={col.titulo}
                columnClass={col.columnClass}
                ordenes={items}
                getVehiculoLabel={getVehiculoLabel}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeOrden ? (
          <div className="w-[280px]">
            <OrdenKanbanCardContent
              orden={activeOrden}
              getVehiculoLabel={getVehiculoLabel}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
