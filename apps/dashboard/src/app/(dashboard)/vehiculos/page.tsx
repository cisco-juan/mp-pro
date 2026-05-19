import { PageHeader } from '@/components/layout/page-header';
import { VehiculosTable } from '@/components/vehiculos/vehiculos-table';

export const metadata = {
  title: 'Vehículos',
};

export default function VehiculosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vehículos"
        description="Flota de vehículos vinculados a tus clientes"
      />
      <VehiculosTable />
    </div>
  );
}
