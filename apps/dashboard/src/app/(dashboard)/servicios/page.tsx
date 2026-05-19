import { PageHeader } from '@/components/layout/page-header';
import { ServiciosTable } from '@/components/servicios/servicios-table';

export const metadata = {
  title: 'Servicios',
};

export default function ServiciosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Servicios"
        description="Catálogo de servicios ofrecidos por el taller"
      />
      <ServiciosTable />
    </div>
  );
}
