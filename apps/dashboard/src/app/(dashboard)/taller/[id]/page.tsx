import { OrdenTrabajoDetalleView } from '@/components/taller/orden-trabajo-detalle-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Orden ${id}` };
}

export default async function OrdenTrabajoDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <OrdenTrabajoDetalleView id={id} />;
}
