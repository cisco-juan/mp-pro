'use client';

import { useState } from 'react';
import { FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrdenesTable } from './ordenes-table';

export function OrdenesView() {
  const [vista, setVista] = useState<'cotizaciones' | 'facturas'>('cotizaciones');

  return (
    <div className="flex flex-col gap-4">
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

      {vista === 'cotizaciones' ? (
        <OrdenesTable tipo="cotizacion" />
      ) : (
        <OrdenesTable tipo="factura" />
      )}
    </div>
  );
}
