'use client';

import { useState } from 'react';
import { FileText, Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NuevaCotizacionDialog } from './nueva-cotizacion-dialog';
import { OrdenesTable } from './ordenes-table';

export function OrdenesView() {
  const [vista, setVista] = useState<'cotizaciones' | 'facturas'>('cotizaciones');
  const [openNueva, setOpenNueva] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={vista === 'cotizaciones' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('cotizaciones')}
            className="min-h-10"
          >
            <FileText className="size-4" />
            Cotizaciones
          </Button>
          <Button
            variant={vista === 'facturas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('facturas')}
            className="min-h-10"
          >
            <Receipt className="size-4" />
            Facturas
          </Button>
        </div>
        <Button className="min-h-11" onClick={() => setOpenNueva(true)}>
          <Plus className="size-4" />
          Nueva cotización
        </Button>
      </div>

      {vista === 'cotizaciones' ? (
        <OrdenesTable tipo="cotizacion" />
      ) : (
        <OrdenesTable tipo="factura" />
      )}

      <NuevaCotizacionDialog open={openNueva} onOpenChange={setOpenNueva} />
    </div>
  );
}
