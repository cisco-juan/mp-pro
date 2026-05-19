import { PageHeader } from '@/components/layout/page-header';
import { CitasView } from '@/components/citas/citas-view';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Citas',
};

export default function CitasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Citas"
        description="Agenda y programación de citas del taller"
        actions={<Button className="min-h-11">Nueva cita</Button>}
      />
      <CitasView />
    </div>
  );
}
