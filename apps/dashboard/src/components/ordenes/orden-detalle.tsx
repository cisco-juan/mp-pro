'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  OrdenComercialEstadoBadge,
  OrdenComercialTipoBadge,
} from '@/components/shared/status-badge';
import {
  getOrdenComercialEstadoLabel,
  ordenComercialTipoLabels,
  type OrdenComercial,
} from '@/lib/mock-data';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import { useTallerStore } from '@/lib/taller/taller-store';
import { formatDisplayDate } from '@org/utils-shared';

interface OrdenDetalleProps {
  orden: OrdenComercial;
}

export function OrdenDetalle({ orden: ordenProp }: OrdenDetalleProps) {
  const router = useRouter();
  const { getVehiculoLabel, getClienteNombre } = useClientesStore();
  const { getOrdenTrabajo } = useTallerStore();
  const {
    getOrdenComercial,
    getTotalPagado,
    updateCotizacionEstado,
    updateFacturaEstado,
    convertCotizacionToFactura,
  } = useOrdenesComercialesStore();

  const orden = getOrdenComercial(ordenProp.id) ?? ordenProp;
  const ot = orden.ordenTrabajoId ? getOrdenTrabajo(orden.ordenTrabajoId) : undefined;
  const totalPagado = getTotalPagado(orden.id);
  const pendiente = orden.total - totalPagado;

  async function handleEnviarCotizacion() {
    if (await updateCotizacionEstado(orden.id, 'enviada')) {
      toast.success('Cotización enviada', { description: orden.numero });
    }
  }

  async function handleAceptarCotizacion() {
    if (await updateCotizacionEstado(orden.id, 'aceptada')) {
      toast.success('Cotización aceptada');
    }
  }

  async function handleRechazarCotizacion() {
    if (await updateCotizacionEstado(orden.id, 'rechazada')) {
      toast.success('Cotización rechazada');
    }
  }

  async function handleConvertirFactura() {
    const factura = await convertCotizacionToFactura(orden.id);
    if (!factura) {
      toast.error('No se pudo convertir la cotización');
      return;
    }
    toast.success('Factura creada en borrador', { description: factura.numero });
    router.push(`/ordenes/${factura.id}`);
  }

  async function handleEmitirFactura() {
    if (await updateFacturaEstado(orden.id, 'emitida')) {
      toast.success('Factura emitida', { description: orden.numero });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <OrdenComercialTipoBadge
              tipo={orden.tipo}
              label={ordenComercialTipoLabels[orden.tipo]}
            />
            <OrdenComercialEstadoBadge
              tipo={orden.tipo}
              estado={orden.estado}
              label={getOrdenComercialEstadoLabel(orden)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium">{getClienteNombre(orden.clienteId)}</p>
            </div>
            {orden.vehiculoId && (
              <div>
                <p className="text-xs text-muted-foreground">Vehículo</p>
                <p className="font-medium">{getVehiculoLabel(orden.vehiculoId)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-medium">{formatDisplayDate(orden.fecha)}</p>
            </div>
            {orden.validezHasta && (
              <div>
                <p className="text-xs text-muted-foreground">Validez hasta</p>
                <p className="font-medium">{formatDisplayDate(orden.validezHasta)}</p>
              </div>
            )}
            {ot && (
              <div>
                <p className="text-xs text-muted-foreground">OT vinculada</p>
                <Link href={`/taller/${ot.id}`} className="font-medium text-primary hover:underline">
                  {ot.numero}
                </Link>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orden.lineas.map((linea) => (
                <TableRow key={linea.id}>
                  <TableCell>{linea.descripcion}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{linea.tipo}</TableCell>
                  <TableCell className="text-right font-mono">{linea.cantidad}</TableCell>
                  <TableCell className="text-right font-mono">
                    {linea.precioUnitario.toLocaleString('es-ES')} €
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {linea.subtotal.toLocaleString('es-ES')} €
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{orden.subtotal.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (21%)</span>
              <span className="font-mono">{orden.iva.toLocaleString('es-ES')} €</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">{orden.total.toLocaleString('es-ES')} €</span>
            </div>
            {orden.tipo === 'factura' && (
              <>
                <div className="flex justify-between text-emerald-700">
                  <span>Pagado</span>
                  <span className="font-mono">{totalPagado.toLocaleString('es-ES')} €</span>
                </div>
                {pendiente > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Pendiente</span>
                    <span className="font-mono">{pendiente.toLocaleString('es-ES')} €</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {orden.tipo === 'cotizacion' && orden.estado === 'borrador' && (
              <Button onClick={handleEnviarCotizacion} className="min-h-10">
                Enviar cotización
              </Button>
            )}
            {orden.tipo === 'cotizacion' && orden.estado === 'enviada' && (
              <>
                <Button onClick={handleAceptarCotizacion} className="min-h-10">
                  Marcar como aceptada
                </Button>
                <Button variant="outline" onClick={handleRechazarCotizacion} className="min-h-10">
                  Rechazar
                </Button>
              </>
            )}
            {orden.tipo === 'cotizacion' && orden.estado === 'aceptada' && (
              <Button onClick={handleConvertirFactura} className="min-h-10">
                Convertir a factura
              </Button>
            )}
            {orden.tipo === 'factura' && orden.estado === 'borrador' && (
              <Button onClick={handleEmitirFactura} className="min-h-10">
                Emitir factura
              </Button>
            )}
            {orden.tipo === 'factura' && orden.estado === 'emitida' && pendiente > 0 && (
              <Button className="min-h-10" asChild>
                <Link href={`/pagos?factura=${orden.id}`}>Registrar pago</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
