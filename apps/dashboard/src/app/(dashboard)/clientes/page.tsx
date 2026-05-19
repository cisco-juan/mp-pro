import { PageHeader } from '@/components/layout/page-header';
import { ClientesTable } from '@/components/clientes/clientes-table';

export const metadata = {
  title: 'Clientes',
};

export default function ClientesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Gestiona la cartera de clientes de tu taller"
      />
      <ClientesTable />
    </div>
  );
}
