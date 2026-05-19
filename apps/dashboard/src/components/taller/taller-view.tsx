'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from './kanban-board';
import { OrdenesTrabajoTable } from './ordenes-trabajo-table';

export function TallerView() {
  const [vista, setVista] = useState<'kanban' | 'tabla'>('kanban');

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
