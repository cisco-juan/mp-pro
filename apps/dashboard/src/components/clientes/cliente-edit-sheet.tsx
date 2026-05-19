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
import { ClienteForm } from '@/components/clientes/cliente-form';
import type { Cliente, ClienteFormValues } from '@/lib/mock-data';

const EDIT_FORM_ID = 'cliente-edit-form';

interface ClienteEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onSubmit: (values: ClienteFormValues) => void;
}

export function ClienteEditSheet({
  open,
  onOpenChange,
  cliente,
  onSubmit,
}: ClienteEditSheetProps) {
  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">Editar cliente</SheetTitle>
          <SheetDescription>
            {cliente
              ? `Actualiza los datos de ${cliente.nombre}`
              : 'Actualiza los datos del cliente'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          {cliente && (
            <ClienteForm
              key={`${cliente.id}-${open}`}
              formId={EDIT_FORM_ID}
              layout="sheet"
              hideFooter
              mode="edit"
              cliente={cliente}
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
