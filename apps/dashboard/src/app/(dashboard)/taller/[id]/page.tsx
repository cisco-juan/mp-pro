import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import {
  OrdenEstadoBadge,
  OrdenTrabajoTipoBadge,
} from '@/components/shared/status-badge';
import { GenerarCotizacionButton } from '@/components/taller/generar-cotizacion-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getOrdenTrabajoById,
  getClienteNombre,
  getVehiculoLabel,
  getUsuarioById,
  getPiezaNombre,
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const orden = getOrdenTrabajoById(id);
  return { title: orden ? orden.numero : 'Orden de trabajo' };
}

export default async function OrdenTrabajoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const orden = getOrdenTrabajoById(id);

  if (!orden) {
    notFound();
  }

  const mecanico = getUsuarioById(orden.usuarioId);
  const totalPiezas = orden.piezasUsadas.reduce(
    (sum, p) => sum + p.cantidad * p.precioUnitario,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={orden.numero}
        description={orden.descripcion}
        actions={
          <div className="flex flex-wrap gap-2">
            <GenerarCotizacionButton
              ordenTrabajoId={orden.id}
              ordenComercialId={orden.ordenComercialId}
            />
            <Button variant="outline" asChild>
              <Link href="/taller">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Detalle del trabajo</CardTitle>
              <div className="flex flex-wrap gap-2">
                <OrdenTrabajoTipoBadge
                  tipo={orden.tipo}
                  label={ordenTrabajoTipoLabels[orden.tipo]}
                />
                <OrdenEstadoBadge
                  estado={orden.estado}
                  label={ordenEstadoLabels[orden.estado]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{getClienteNombre(orden.clienteId)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vehículo</p>
                <p className="font-medium">{getVehiculoLabel(orden.vehiculoId)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mecánico asignado</p>
                <p className="font-medium">{mecanico?.nombre ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha estimada</p>
                <p className="font-medium">{formatDisplayDate(orden.fechaEstimada)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-semibold">Piezas usadas</h3>
              {orden.piezasUsadas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin piezas registradas</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pieza</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orden.piezasUsadas.map((pu, i) => (
                      <TableRow key={i}>
                        <TableCell>{getPiezaNombre(pu.piezaId)}</TableCell>
                        <TableCell className="text-right font-mono">{pu.cantidad}</TableCell>
                        <TableCell className="text-right font-mono">
                          {pu.precioUnitario.toLocaleString('es-ES')} €
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(pu.cantidad * pu.precioUnitario).toLocaleString('es-ES')} €
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total piezas
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {totalPiezas.toLocaleString('es-ES')} €
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-semibold">Checklist</h3>
              <ul className="flex flex-col gap-2">
                {orden.checklist.map((item, i) => (
                  <li
                    key={i}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm',
                      item.completado && 'bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border',
                        item.completado
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border'
                      )}
                    >
                      {item.completado && <Check className="size-3" />}
                    </div>
                    <span className={item.completado ? 'text-muted-foreground line-through' : ''}>
                      {item.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total estimado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-bold">
                {orden.totalEstimado.toLocaleString('es-ES')} €
              </p>
              {orden.piezasUsadas.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Incluye {totalPiezas.toLocaleString('es-ES')} € en piezas
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
              <CardDescription>Historial de estados</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative flex flex-col gap-4 border-l border-border pl-4">
                {orden.timeline.map((evento, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
                    <p className="font-mono text-xs text-muted-foreground">{evento.fecha}</p>
                    <p className="text-sm font-medium">{ordenEstadoLabels[evento.estado]}</p>
                    <p className="text-xs text-muted-foreground">{evento.nota}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
