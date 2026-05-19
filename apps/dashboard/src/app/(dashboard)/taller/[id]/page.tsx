import { OrdenTrabajoDetalleView } from '@/components/taller/orden-trabajo-detalle-view';
import { getOrdenTrabajoById } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const orden = getOrdenTrabajoById(id);
  return { title: orden ? orden.numero : 'Orden de trabajo' };
}

export default async function OrdenTrabajoDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <OrdenTrabajoDetalleView id={id} />;
}
