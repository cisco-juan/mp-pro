'use client';

import { PageHeader } from '@/components/layout/page-header';
import { InventarioTable } from '@/components/inventario/inventario-table';
import { useInventarioStore } from '@/lib/inventario/inventario-store';

export function InventarioPageContent() {
  const { piezas, stockBajoCount } = useInventarioStore();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario"
        description={`${piezas.length} piezas registradas · ${stockBajoCount} con stock bajo`}
      />
      <InventarioTable />
    </div>
  );
}
