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
import { VehiculoForm } from '@/components/vehiculos/vehiculo-form';
import type { Vehiculo, VehiculoFormValues } from '@/lib/mock-data';

const EDIT_FORM_ID = 'vehiculo-edit-form';

interface VehiculoEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehiculo: Vehiculo | null;
  onSubmit: (values: VehiculoFormValues) => void;
}

export function VehiculoEditSheet({
  open,
  onOpenChange,
  vehiculo,
  onSubmit,
}: VehiculoEditSheetProps) {
  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">Editar vehículo</SheetTitle>
          <SheetDescription>
            {vehiculo
              ? `Actualiza los datos de ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`
              : 'Actualiza los datos del vehículo'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          {vehiculo && (
            <VehiculoForm
              key={`${vehiculo.id}-${open}`}
              formId={EDIT_FORM_ID}
              layout="sheet"
              hideFooter
              mode="edit"
              vehiculo={vehiculo}
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
