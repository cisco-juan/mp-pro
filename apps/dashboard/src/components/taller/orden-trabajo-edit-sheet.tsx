'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { OrdenTrabajoForm } from '@/components/taller/orden-trabajo-form';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import type { OrdenTrabajo, OrdenTrabajoFormValues } from '@/lib/mock-data';

const EDIT_FORM_ID = 'orden-trabajo-edit-form';

interface OrdenTrabajoEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orden: OrdenTrabajo | null;
  onSubmit: (values: OrdenTrabajoFormValues) => void;
}

export function OrdenTrabajoEditSheet({
  open,
  onOpenChange,
  orden,
  onSubmit,
}: OrdenTrabajoEditSheetProps) {
  const { getClienteNombre } = useClientesStore();

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">Editar orden de trabajo</SheetTitle>
          <SheetDescription>
            {orden
              ? `${orden.numero} · ${getClienteNombre(orden.clienteId)}`
              : 'Actualiza los datos del trabajo'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          {orden && (
            <OrdenTrabajoForm
              key={`${orden.id}-${open}`}
              formId={EDIT_FORM_ID}
              layout="sheet"
              hideFooter
              mode="edit"
              orden={orden}
              onSubmit={onSubmit}
            />
          )}
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t bg-background px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose} className="min-h-10">
            Cancelar
          </Button>
          <Button type="submit" form={EDIT_FORM_ID} className="min-h-10">
            Guardar cambios
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
