import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { OrdenDetalle } from '@/components/ordenes/orden-detalle';
import { Button } from '@/components/ui/button';
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
  const orden = getOrdenComercialById(id);

  if (!orden) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={orden.numero}
        description={
          orden.tipo === 'cotizacion'
            ? 'Cotización comercial'
            : 'Factura de servicios y piezas'
        }
        actions={
          <Button variant="outline" asChild>
            <Link href="/ordenes">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />
      <OrdenDetalle orden={orden} />
    </div>
  );
}
