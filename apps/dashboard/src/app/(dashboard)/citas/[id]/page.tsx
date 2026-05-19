import { PageHeader } from '@/components/layout/page-header';
import { CitaDetalleView } from '@/components/citas/cita-detalle-view';
import { getCitaById, getClienteNombre, getServicioNombre } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const cita = getCitaById(id);
  if (!cita) {
    return { title: 'Cita no encontrada' };
  }
  return {
    title: `${getServicioNombre(cita.servicioId)} · ${getClienteNombre(cita.clienteId)}`,
  };
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
