import { VehiculoDetalleView } from '@/components/vehiculos/vehiculo-detalle-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateMetadata() {
  return { title: 'Vehículo' };
}

export default async function VehiculoDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <VehiculoDetalleView id={id} />;
}
