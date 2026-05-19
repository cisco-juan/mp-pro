'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useInventarioStore } from '@/lib/inventario/inventario-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import { useTallerStore } from '@/lib/taller/taller-store';

interface GenerarCotizacionButtonProps {
  ordenTrabajoId: string;
  ordenComercialId?: string;
}

export function GenerarCotizacionButton({
  ordenTrabajoId,
  ordenComercialId,
}: GenerarCotizacionButtonProps) {
  const router = useRouter();
  const { getOrdenTrabajo, linkOrdenComercial } = useTallerStore();
  const { getPiezaNombre } = useInventarioStore();
  const { getOrdenComercial, getOrdenComercialByOrdenTrabajoId, createCotizacionFromOrdenTrabajo } =
    useOrdenesComercialesStore();

  const existente =
    (ordenComercialId ? getOrdenComercial(ordenComercialId) : undefined) ??
    getOrdenComercialByOrdenTrabajoId(ordenTrabajoId);

  function handleGenerar() {
    const orden = getOrdenTrabajo(ordenTrabajoId);
    if (!orden) return;

    const cotizacion = createCotizacionFromOrdenTrabajo(orden, getPiezaNombre);
    linkOrdenComercial(ordenTrabajoId, cotizacion.id);
    toast.success('Cotización generada', {
      description: `Se ha creado ${cotizacion.numero} en borrador.`,
    });
    router.push(`/ordenes/${cotizacion.id}`);
  }

  if (existente) {
    return (
      <Button variant="outline" asChild className="min-h-11">
        <Link href={`/ordenes/${existente.id}`}>
          <FileText className="size-4" />
          Ver {existente.tipo === 'factura' ? 'factura' : 'cotización'}
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleGenerar} className="min-h-11">
      <FileText className="size-4" />
      Generar cotización
    </Button>
  );
}
