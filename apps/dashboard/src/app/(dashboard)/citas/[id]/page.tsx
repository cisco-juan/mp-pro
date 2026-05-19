import { PageHeader } from '@/components/layout/page-header';
import { CitaDetalleView } from '@/components/citas/cita-detalle-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateMetadata() {
  return { title: 'Detalle de cita' };
}

export default async function CitaDetallePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Detalle de cita"
        description="Información completa de la cita programada"
      />
      <CitaDetalleView id={id} />
    </div>
  );
}
