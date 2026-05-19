import { VehiculoDetalleView } from '@/components/vehiculos/vehiculo-detalle-view';
import { getVehiculoById } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const vehiculo = getVehiculoById(id);
  return {
    title: vehiculo
      ? `${vehiculo.matricula} · ${vehiculo.marca} ${vehiculo.modelo}`
      : 'Vehículo',
  };
}

export default async function VehiculoDetallePage({ params }: PageProps) {
  const { id } = await params;
  return <VehiculoDetalleView id={id} />;
}
