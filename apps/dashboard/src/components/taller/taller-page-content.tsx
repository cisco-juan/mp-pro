'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { TallerView } from '@/components/taller/taller-view';
import { OrdenTrabajoForm } from '@/components/taller/orden-trabajo-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTallerStore } from '@/lib/taller/taller-store';
import type { OrdenTrabajoFormValues } from '@/lib/mock-data';

export function TallerPageContent() {
  const router = useRouter();
  const { createOrdenTrabajo, getOrdenesAbiertasCount } = useTallerStore();
  const [openCreate, setOpenCreate] = useState(false);
  const count = getOrdenesAbiertasCount();

  function handleCreate(values: OrdenTrabajoFormValues) {
    const orden = createOrdenTrabajo(values);
    toast.success('Orden de trabajo creada (maquetación)');
    setOpenCreate(false);
    router.push(`/taller/${orden.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Taller"
        description={`${count} trabajo${count === 1 ? '' : 's'} abierto${count === 1 ? '' : 's'} en el taller`}
        actions={
          <Button className="min-h-11" onClick={() => setOpenCreate(true)}>
            Nuevo trabajo
          </Button>
        }
      />
      <TallerView />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva orden de trabajo</DialogTitle>
            <DialogDescription>
              Registra un nuevo trabajo de mantenimiento o reparación en el taller.
            </DialogDescription>
          </DialogHeader>
          <OrdenTrabajoForm
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
