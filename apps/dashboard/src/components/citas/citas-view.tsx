'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CitasSemanaGrid } from '@/components/citas/citas-semana-grid';
import { CitasTable } from '@/components/citas/citas-table';

interface CitasViewProps {
  openCreate?: boolean;
  onOpenCreateChange?: (open: boolean) => void;
}

export function CitasView({ openCreate, onOpenCreateChange }: CitasViewProps) {
  const [vista, setVista] = useState<'semana' | 'lista'>('semana');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={vista === 'semana' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVista('semana')}
          className="min-h-10"
        >
          <LayoutGrid className="size-4" />
          Semana
        </Button>
        <Button
          variant={vista === 'lista' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVista('lista')}
          className="min-h-10"
        >
          <List className="size-4" />
          Lista
        </Button>
      </div>

      {vista === 'semana' ? (
        <CitasSemanaGrid />
      ) : (
        <CitasTable
          openCreate={openCreate}
          onOpenCreateChange={onOpenCreateChange}
          hideCreateButton={Boolean(onOpenCreateChange)}
        />
      )}
    </div>
  );
}
