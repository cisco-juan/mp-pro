import { PageHeader } from '@/components/layout/page-header';
import { InventarioTable } from '@/components/inventario/inventario-table';
import { piezas } from '@/lib/mock-data';

export const metadata = {
  title: 'Inventario',
};

export default function InventarioPage() {
  const stockBajo = piezas.filter((p) => p.stock <= p.stockMinimo).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario"
        description={`${piezas.length} piezas registradas · ${stockBajo} con stock bajo`}
      />
      <InventarioTable />
    </div>
  );
}
