import { PageHeader } from '@/components/layout/page-header';
import { PagosTable } from '@/components/pagos/pagos-table';

export const metadata = {
  title: 'Pagos',
};

export default function PagosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pagos"
        description="Registro de cobros asociados a facturas"
      />
      <PagosTable />
    </div>
  );
}
