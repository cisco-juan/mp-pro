import { PageHeader } from '@/components/layout/page-header';
import { OrdenesView } from '@/components/ordenes/ordenes-view';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Órdenes',
};

export default function OrdenesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Órdenes"
        description="Cotizaciones y facturas de servicios y piezas"
        actions={<Button className="min-h-11">Nueva cotización</Button>}
      />
      <OrdenesView />
    </div>
  );
}
