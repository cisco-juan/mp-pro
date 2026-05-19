import { PageHeader } from '@/components/layout/page-header';
import { KanbanBoard } from '@/components/mantenimiento/kanban-board';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Mantenimiento',
};

export default function MantenimientoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mantenimiento"
        description="Órdenes de trabajo y reparaciones en curso"
        actions={<Button className="min-h-11">Nueva orden</Button>}
      />
      <KanbanBoard />
    </div>
  );
}
