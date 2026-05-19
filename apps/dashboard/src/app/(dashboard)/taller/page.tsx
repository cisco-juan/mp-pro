import { PageHeader } from '@/components/layout/page-header';
import { TallerView } from '@/components/taller/taller-view';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Taller',
};

export default function TallerPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Taller"
        description="Mantenimientos, reparaciones y órdenes de trabajo en curso"
        actions={<Button className="min-h-11">Nuevo trabajo</Button>}
      />
      <TallerView />
    </div>
  );
}
