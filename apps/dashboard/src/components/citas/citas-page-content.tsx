'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { CitasView } from '@/components/citas/citas-view';
import { CitaForm } from '@/components/citas/cita-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCitasStore } from '@/lib/citas/citas-store';
import type { CitaFormValues } from '@/lib/mock-data';

export function CitasPageContent() {
  const { createCita, getCitasCountSemanaActual } = useCitasStore();
  const [openCreate, setOpenCreate] = useState(false);
  const count = getCitasCountSemanaActual();

  function handleCreate(values: CitaFormValues) {
    createCita(values);
    toast.success('Cita creada');
    setOpenCreate(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Citas"
        description={`${count} cita${count === 1 ? '' : 's'} programada${count === 1 ? '' : 's'} esta semana`}
        actions={
          <Button className="min-h-11" onClick={() => setOpenCreate(true)}>
            Nueva cita
          </Button>
        }
      />
      <CitasView openCreate={openCreate} onOpenCreateChange={setOpenCreate} />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva cita</DialogTitle>
            <DialogDescription>
              Programa una cita para un cliente y vehículo del taller.
            </DialogDescription>
          </DialogHeader>
          <CitaForm
            key={String(openCreate)}
            mode="create"
            onSubmit={handleCreate}
            onCancel={() => setOpenCreate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
