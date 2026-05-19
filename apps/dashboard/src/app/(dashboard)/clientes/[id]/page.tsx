import { ClienteDetalleView } from '@/components/clientes/cliente-detalle-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateMetadata() {
  return { title: 'Cliente' };
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <ClienteDetalleView id={id} />;
}
