'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  getOrdenComercialById,
  getOrdenComercialByOrdenTrabajoId,
} from '@/lib/mock-data';

interface GenerarCotizacionButtonProps {
  ordenTrabajoId: string;
  ordenComercialId?: string;
}

export function GenerarCotizacionButton({
  ordenTrabajoId,
  ordenComercialId,
}: GenerarCotizacionButtonProps) {
  const existente =
    ordenComercialId
      ? getOrdenComercialById(ordenComercialId)
      : getOrdenComercialByOrdenTrabajoId(ordenTrabajoId);

  function handleGenerar() {
    toast.success('Cotización generada (maquetación)', {
      description: 'En producción se creará una orden comercial vinculada a esta OT.',
    });
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
