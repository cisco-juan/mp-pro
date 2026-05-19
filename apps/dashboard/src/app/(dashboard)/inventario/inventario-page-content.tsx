'use client';

import { PageHeader } from '@/components/layout/page-header';
import { InventarioTable } from '@/components/inventario/inventario-table';
import { useInventarioStore } from '@/lib/inventario/inventario-store';

export function InventarioPageContent() {
  const { piezas, stockBajoCount, loading, error } = useInventarioStore();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario"
        description={
          loading
            ? 'Cargando inventario…'
            : error
              ? error
              : `${piezas.length} piezas registradas · ${stockBajoCount} con stock bajo`
        }
      />
      <InventarioTable />
    </div>
  );
}
