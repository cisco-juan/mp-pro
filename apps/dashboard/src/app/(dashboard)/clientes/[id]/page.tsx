import { ClienteDetalleView } from '@/components/clientes/cliente-detalle-view';
import { getClienteById } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const cliente = getClienteById(id);
  return { title: cliente ? cliente.nombre : 'Cliente' };
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <ClienteDetalleView id={id} />;
}
