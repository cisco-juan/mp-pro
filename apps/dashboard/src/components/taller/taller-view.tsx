'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTallerStore } from '@/lib/taller/taller-store';
import { KanbanBoard } from './kanban-board';
import { OrdenesTrabajoTable } from './ordenes-trabajo-table';

export function TallerView() {
  const [vista, setVista] = useState<'kanban' | 'tabla'>('kanban');
  const { loading, error } = useTallerStore();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando órdenes de trabajo…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={vista === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVista('kanban')}
          className="min-h-10"
        >
          <LayoutGrid className="size-4" />
          Kanban
        </Button>
        <Button
          variant={vista === 'tabla' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVista('tabla')}
          className="min-h-10"
        >
          <List className="size-4" />
          Tabla
        </Button>
      </div>

      {vista === 'kanban' ? <KanbanBoard /> : <OrdenesTrabajoTable />}
    </div>
  );
}
