import { OrdenComercialDetalleView } from '@/components/ordenes/orden-comercial-detalle-view';
import { getOrdenComercialById } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const orden = getOrdenComercialById(id);
  return { title: orden ? orden.numero : 'Orden comercial' };
}

export default async function OrdenComercialPage({ params }: PageProps) {
  const { id } = await params;
  return <OrdenComercialDetalleView id={id} />;
}
