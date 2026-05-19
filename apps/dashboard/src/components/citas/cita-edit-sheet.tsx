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
import { CitaForm } from '@/components/citas/cita-form';
import { getClienteNombre, getServicioNombre, type Cita, type CitaFormValues } from '@/lib/mock-data';

const EDIT_FORM_ID = 'cita-edit-form';

interface CitaEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cita: Cita | null;
  onSubmit: (values: CitaFormValues) => void;
}

export function CitaEditSheet({
  open,
  onOpenChange,
  cita,
  onSubmit,
}: CitaEditSheetProps) {
  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">Editar cita</SheetTitle>
          <SheetDescription>
            {cita
              ? `${getServicioNombre(cita.servicioId)} · ${getClienteNombre(cita.clienteId)}`
              : 'Actualiza los datos de la cita'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          {cita && (
            <CitaForm
              key={`${cita.id}-${open}`}
              formId={EDIT_FORM_ID}
              layout="sheet"
              hideFooter
              mode="edit"
              cita={cita}
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
