import { OrdenComercialDetalleView } from '@/components/ordenes/orden-comercial-detalle-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateMetadata() {
  return { title: 'Orden comercial' };
}

export default async function OrdenComercialPage({ params }: PageProps) {
  const { id } = await params;
  return <OrdenComercialDetalleView id={id} />;
}
