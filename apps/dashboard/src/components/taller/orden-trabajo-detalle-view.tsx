'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import {
  OrdenEstadoBadge,
  OrdenTrabajoTipoBadge,
} from '@/components/shared/status-badge';
import { GenerarCotizacionButton } from '@/components/taller/generar-cotizacion-button';
import { OrdenTrabajoEditSheet } from '@/components/taller/orden-trabajo-edit-sheet';
import { AgregarPiezaDialog } from '@/components/taller/agregar-pieza-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useInventarioStore } from '@/lib/inventario/inventario-store';
import { useTallerStore } from '@/lib/taller/taller-store';
import { useUsuariosStore } from '@/lib/usuarios/usuarios-store';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import {
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
  type OrdenEstado,
  type OrdenTrabajoFormValues,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';
import { cn } from '@/lib/utils';

interface OrdenTrabajoDetalleViewProps {
  id: string;
}

export function OrdenTrabajoDetalleView({ id }: OrdenTrabajoDetalleViewProps) {
  const {
    getOrdenTrabajo,
    updateOrdenTrabajo,
    updateOrdenEstado,
    toggleChecklistItem,
    addPieza,
    removePieza,
    assignMecanico,
  } = useTallerStore();
  const { getVehiculoLabel, getClienteNombre } = useClientesStore();
  const { getPiezaNombre, reservarStock } = useInventarioStore();
  const { getUsuario, getUsuariosMecanicos } = useUsuariosStore();

  const orden = getOrdenTrabajo(id);
  const [editing, setEditing] = useState(false);
  const [openPieza, setOpenPieza] = useState(false);
  const [estadoTarget, setEstadoTarget] = useState<OrdenEstado | null>(null);

  if (!orden) {
    notFound();
  }

  const ordenData = orden;
  const mecanico = ordenData.usuarioId ? getUsuario(ordenData.usuarioId) : undefined;
  const mecanicos = getUsuariosMecanicos();
  const canEdit = ordenData.estado !== 'completado';
  const totalPiezas = ordenData.piezasUsadas.reduce(
    (sum, p) => sum + p.cantidad * p.precioUnitario,
    0
  );

  function handleUpdate(values: OrdenTrabajoFormValues) {
    const ok = updateOrdenTrabajo(ordenData.id, values);
    if (ok) {
      toast.success('Orden actualizada');
      setEditing(false);
    }
  }

  function handleEstadoChange(estado: OrdenEstado) {
    updateOrdenEstado(ordenData.id, estado);
    toast.success(`OT ${ordenEstadoLabels[estado].toLowerCase()}`);
    setEstadoTarget(null);
  }

  function handleMecanicoChange(usuarioId: string) {
    assignMecanico(ordenData.id, usuarioId);
    toast.success('Mecánico asignado');
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={ordenData.numero}
        description={ordenData.descripcion}
        actions={
          <div className="flex flex-wrap gap-2">
            <GenerarCotizacionButton ordenTrabajoId={ordenData.id} ordenComercialId={ordenData.ordenComercialId} />
            {canEdit && (
              <Button variant="outline" className="min-h-11" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Editar
              </Button>
            )}
            <Button variant="outline" asChild className="min-h-11">
              <Link href="/taller">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {ordenData.estado === 'pendiente' && (
          <Button className="min-h-10" onClick={() => setEstadoTarget('en_progreso')}>
            Iniciar trabajo
          </Button>
        )}
        {ordenData.estado === 'en_progreso' && (
          <>
            <Button className="min-h-10" onClick={() => setEstadoTarget('esperando_piezas')}>
              Esperando piezas
            </Button>
            <Button variant="outline" className="min-h-10" onClick={() => setEstadoTarget('completado')}>
              Marcar completado
            </Button>
          </>
        )}
        {ordenData.estado === 'esperando_piezas' && (
          <>
            <Button className="min-h-10" onClick={() => setEstadoTarget('en_progreso')}>
              Reanudar trabajo
            </Button>
            <Button variant="outline" className="min-h-10" onClick={() => setEstadoTarget('completado')}>
              Marcar completado
            </Button>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Detalle del trabajo</CardTitle>
              <div className="flex flex-wrap gap-2">
                <OrdenTrabajoTipoBadge
                  tipo={ordenData.tipo}
                  label={ordenTrabajoTipoLabels[ordenData.tipo]}
                />
                <OrdenEstadoBadge
                  estado={ordenData.estado}
                  label={ordenEstadoLabels[ordenData.estado]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <Link
                  href={`/clientes/${ordenData.clienteId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {getClienteNombre(ordenData.clienteId)}
                </Link>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vehículo</p>
                <Link
                  href={`/vehiculos/${ordenData.vehiculoId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {getVehiculoLabel(ordenData.vehiculoId)}
                </Link>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Mecánico asignado</Label>
                {canEdit ? (
                  <Select value={ordenData.usuarioId} onValueChange={handleMecanicoChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mecanicos.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{mecanico?.nombre ?? '—'}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha estimada</p>
                <p className="font-medium">{formatDisplayDate(ordenData.fechaEstimada)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Piezas usadas</h3>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-9"
                    onClick={() => setOpenPieza(true)}
                  >
                    <Plus className="size-4" />
                    Añadir pieza
                  </Button>
                )}
              </div>
              {ordenData.piezasUsadas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin piezas registradas</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pieza</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      {canEdit && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenData.piezasUsadas.map((pu, i) => (
                      <TableRow key={`${pu.piezaId}-${i}`}>
                        <TableCell>{getPiezaNombre(pu.piezaId)}</TableCell>
                        <TableCell className="text-right font-mono">{pu.cantidad}</TableCell>
                        <TableCell className="text-right font-mono">
                          {pu.precioUnitario.toLocaleString('es-ES')} €
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {(pu.cantidad * pu.precioUnitario).toLocaleString('es-ES')} €
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive"
                              onClick={() => {
                                removePieza(ordenData.id, i);
                                toast.success('Pieza eliminada');
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={canEdit ? 3 : 3} className="text-right font-medium">
                        Total piezas
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {totalPiezas.toLocaleString('es-ES')} €
                      </TableCell>
                      {canEdit && <TableCell />}
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-semibold">Checklist</h3>
              <ul className="flex flex-col gap-2">
                {ordenData.checklist.map((item, i) => (
                  <li
                    key={i}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm',
                      item.completado && 'bg-muted/50'
                    )}
                  >
                    {canEdit ? (
                      <Checkbox
                        checked={item.completado}
                        onCheckedChange={() => toggleChecklistItem(ordenData.id, i)}
                      />
                    ) : (
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
                    )}
                    <span
                      className={item.completado ? 'text-muted-foreground line-through' : ''}
                    >
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
                {ordenData.totalEstimado.toLocaleString('es-ES')} €
              </p>
              {ordenData.piezasUsadas.length > 0 && (
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
                {ordenData.timeline.map((evento, i) => (
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

      <OrdenTrabajoEditSheet
        open={editing}
        onOpenChange={setEditing}
        orden={ordenData}
        onSubmit={handleUpdate}
      />

      <AgregarPiezaDialog
        open={openPieza}
        onOpenChange={setOpenPieza}
        piezasExistentes={ordenData.piezasUsadas}
        onAdd={(pieza) => {
          if (!reservarStock(pieza.piezaId, pieza.cantidad)) {
            toast.error('Stock insuficiente en inventario');
            return;
          }
          addPieza(ordenData.id, pieza);
          toast.success('Pieza añadida');
        }}
      />

      <Dialog open={Boolean(estadoTarget)} onOpenChange={(open) => !open && setEstadoTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogDescription>
              {estadoTarget &&
                `¿Marcar esta orden como ${ordenEstadoLabels[estadoTarget].toLowerCase()}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEstadoTarget(null)} className="min-h-10">
              Cancelar
            </Button>
            <Button
              onClick={() => estadoTarget && handleEstadoChange(estadoTarget)}
              className="min-h-10"
              variant={estadoTarget === 'completado' ? 'default' : 'default'}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
