'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Ban,
  Calendar,
  Car,
  FileText,
  Gauge,
  Pencil,
  Shield,
  User,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaginatedList } from '@/components/shared/paginated-list';
import {
  CitaEstadoBadge,
  GarantiaEstadoBadge,
  OrdenComercialEstadoBadge,
  OrdenComercialTipoBadge,
  OrdenEstadoBadge,
  OrdenTrabajoTipoBadge,
  UrgenciaBadge,
  VehiculoEstadoBadge,
} from '@/components/shared/status-badge';
import { VehiculoEditSheet } from '@/components/vehiculos/vehiculo-edit-sheet';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useCitasStore } from '@/lib/citas/citas-store';
import {
  citaEstadoLabels,
  getGarantiasByVehiculoId,
  getOrdenComercialEstadoLabel,
  getOrdenesComercialesByVehiculoId,
  getOrdenesTrabajoByVehiculoId,
  getPiezasUsadasByVehiculoId,
  getServicioNombre,
  ordenComercialTipoLabels,
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
  type Vehiculo,
  type VehiculoFormValues,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

interface VehiculoDetalleViewProps {
  id: string;
}

export function VehiculoDetalleView({ id }: VehiculoDetalleViewProps) {
  const { getVehiculo, getCliente, updateVehiculo, toggleVehiculoEstado } = useClientesStore();
  const vehiculoOrNull = getVehiculo(id);

  if (!vehiculoOrNull) {
    notFound();
  }

  return (
    <VehiculoDetalleContent
      id={id}
      vehiculo={vehiculoOrNull}
      getCliente={getCliente}
      updateVehiculo={updateVehiculo}
      toggleVehiculoEstado={toggleVehiculoEstado}
    />
  );
}

function VehiculoDetalleContent({
  id,
  vehiculo,
  getCliente,
  updateVehiculo,
  toggleVehiculoEstado,
}: {
  id: string;
  vehiculo: Vehiculo;
  getCliente: ReturnType<typeof useClientesStore>['getCliente'];
  updateVehiculo: ReturnType<typeof useClientesStore>['updateVehiculo'];
  toggleVehiculoEstado: ReturnType<typeof useClientesStore>['toggleVehiculoEstado'];
}) {
  const cliente = getCliente(vehiculo.clienteId);
  const { getCitasByVehiculo } = useCitasStore();
  const citas = getCitasByVehiculo(id);
  const ordenesTrabajo = getOrdenesTrabajoByVehiculoId(id);
  const mantenimientos = ordenesTrabajo.filter((o) => o.tipo === 'mantenimiento');
  const reparaciones = ordenesTrabajo.filter((o) => o.tipo === 'reparacion');
  const piezasUsadas = getPiezasUsadasByVehiculoId(id);
  const ordenesComerciales = getOrdenesComercialesByVehiculoId(id);
  const garantiasVehiculo = getGarantiasByVehiculoId(id);
  const garantiasVigentes = garantiasVehiculo.filter((g) => g.estado === 'vigente');

  const [openEdit, setOpenEdit] = useState(false);
  const [openDeactivate, setOpenDeactivate] = useState(false);

  function handleUpdate(values: VehiculoFormValues) {
    const ok = updateVehiculo(id, values);
    if (ok) {
      toast.success('Vehículo actualizado');
      setOpenEdit(false);
    } else {
      toast.error('No se pudo actualizar');
    }
  }

  function handleToggle() {
    if (vehiculo.estado === 'activo') {
      setOpenDeactivate(true);
      return;
    }
    toggleVehiculoEstado(id);
    toast.success('Vehículo activado');
  }

  function confirmDeactivate() {
    toggleVehiculoEstado(id);
    toast.success('Vehículo dado de baja');
    setOpenDeactivate(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
            <Car className="size-7 text-primary" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-2xl font-semibold tracking-tight">
                {vehiculo.matricula}
              </h1>
              <VehiculoEstadoBadge activo={vehiculo.estado === 'activo'} />
              <UrgenciaBadge urgencia={vehiculo.urgencia} />
            </div>
            <p className="text-muted-foreground">
              {vehiculo.marca} {vehiculo.modelo} · {vehiculo.anio} · {vehiculo.color}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/vehiculos">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setOpenEdit(true)}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button
            variant={vehiculo.estado === 'activo' ? 'outline' : 'default'}
            onClick={handleToggle}
          >
            {vehiculo.estado === 'activo' ? (
              <>
                <Ban className="size-4" />
                Dar de baja
              </>
            ) : (
              <>
                <Car className="size-4" />
                Activar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Datos del vehículo</CardTitle>
            <CardDescription>Información técnica y mantenimiento</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailRow icon={Gauge} label="Kilometraje" value={`${vehiculo.kilometraje.toLocaleString('es-ES')} km`} />
            <DetailRow
              icon={Calendar}
              label="Próximo mantenimiento"
              value={formatDisplayDate(vehiculo.proximoMantenimiento)}
            />
            <DetailRow icon={Car} label="Marca / modelo" value={`${vehiculo.marca} ${vehiculo.modelo}`} />
            <DetailRow icon={Car} label="Año" value={String(vehiculo.anio)} />
            <DetailRow icon={Car} label="Color" value={vehiculo.color} />
            {cliente && (
              <DetailRow
                icon={User}
                label="Cliente"
                value={
                  <Link href={`/clientes/${cliente.id}`} className="text-primary hover:underline">
                    {cliente.nombre}
                  </Link>
                }
                className="sm:col-span-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <SummaryRow icon={Calendar} label="Citas" value={String(citas.length)} />
            <SummaryRow icon={Wrench} label="Mantenimientos" value={String(mantenimientos.length)} />
            <SummaryRow icon={Wrench} label="Reparaciones" value={String(reparaciones.length)} />
            <SummaryRow icon={FileText} label="Piezas usadas" value={String(piezasUsadas.length)} />
            <SummaryRow icon={FileText} label="Órdenes comerciales" value={String(ordenesComerciales.length)} />
            <SummaryRow icon={Shield} label="Garantías vigentes" value={String(garantiasVigentes.length)} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="citas">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="citas">Citas ({citas.length})</TabsTrigger>
          <TabsTrigger value="mantenimientos">Mantenimientos ({mantenimientos.length})</TabsTrigger>
          <TabsTrigger value="reparaciones">Reparaciones ({reparaciones.length})</TabsTrigger>
          <TabsTrigger value="piezas">Piezas ({piezasUsadas.length})</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes ({ordenesComerciales.length})</TabsTrigger>
          <TabsTrigger value="garantias">Garantías ({garantiasVehiculo.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="citas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={citas}
                emptyMessage="Sin citas registradas para este vehículo"
                renderItem={(c) => (
                  <Link
                    key={c.id}
                    href={`/citas/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{getServicioNombre(c.servicioId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDisplayDate(c.fecha)} · {c.hora}
                      </p>
                    </div>
                    <CitaEstadoBadge estado={c.estado} label={citaEstadoLabels[c.estado]} />
                  </Link>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mantenimientos" className="mt-4">
          <OrdenTrabajoList
            items={mantenimientos}
            emptyMessage="Sin mantenimientos registrados"
          />
        </TabsContent>

        <TabsContent value="reparaciones" className="mt-4">
          <OrdenTrabajoList items={reparaciones} emptyMessage="Sin reparaciones registradas" />
        </TabsContent>

        <TabsContent value="piezas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Piezas utilizadas</CardTitle>
              <CardDescription>Historial de piezas en órdenes de trabajo</CardDescription>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={piezasUsadas}
                emptyMessage="Sin piezas registradas en taller"
                renderItem={(p) => (
                  <div
                    key={`${p.ordenTrabajoId}-${p.piezaId}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{p.piezaNombre}</p>
                      <p className="text-xs text-muted-foreground">
                        OT {p.ordenNumero} · {formatDisplayDate(p.fechaEntrada)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">×{p.cantidad}</p>
                      <p className="text-xs text-muted-foreground">
                        {(p.precioUnitario * p.cantidad).toLocaleString('es-ES')} €
                      </p>
                    </div>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ordenes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cotizaciones y facturas</CardTitle>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={ordenesComerciales}
                emptyMessage="Sin órdenes comerciales"
                renderItem={(o) => (
                  <Link
                    key={o.id}
                    href={`/ordenes/${o.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium">{o.numero}</p>
                      <OrdenComercialTipoBadge
                        tipo={o.tipo}
                        label={ordenComercialTipoLabels[o.tipo]}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {o.total.toLocaleString('es-ES')} €
                      </span>
                      <OrdenComercialEstadoBadge
                        tipo={o.tipo}
                        estado={o.estado}
                        label={getOrdenComercialEstadoLabel(o)}
                      />
                    </div>
                  </Link>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="garantias" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Garantías</CardTitle>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={garantiasVehiculo}
                emptyMessage="Sin garantías registradas"
                renderItem={(g) => (
                  <div
                    key={g.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{g.concepto}</p>
                      {g.proveedor && (
                        <p className="text-xs text-muted-foreground">{g.proveedor}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDisplayDate(g.fechaInicio)} – {formatDisplayDate(g.fechaFin)}
                      </p>
                      {g.notas && (
                        <p className="mt-2 text-xs text-muted-foreground">{g.notas}</p>
                      )}
                    </div>
                    <GarantiaEstadoBadge estado={g.estado} />
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VehiculoEditSheet
        open={openEdit}
        onOpenChange={setOpenEdit}
        vehiculo={vehiculo}
        onSubmit={handleUpdate}
      />

      <Dialog open={openDeactivate} onOpenChange={setOpenDeactivate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dar de baja vehículo</DialogTitle>
            <DialogDescription>
              ¿Dar de baja <strong>{vehiculo.matricula}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDeactivate(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Dar de baja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrdenTrabajoList({
  items,
  emptyMessage,
}: {
  items: ReturnType<typeof getOrdenesTrabajoByVehiculoId>;
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Órdenes de trabajo</CardTitle>
      </CardHeader>
      <CardContent>
        <PaginatedList
          items={items}
          emptyMessage={emptyMessage}
          renderItem={(o) => (
            <Link
              key={o.id}
              href={`/taller/${o.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium">{o.numero}</p>
                  <OrdenTrabajoTipoBadge
                    tipo={o.tipo}
                    label={ordenTrabajoTipoLabels[o.tipo]}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{o.descripcion}</p>
              </div>
              <OrdenEstadoBadge estado={o.estado} label={ordenEstadoLabels[o.estado]} />
            </Link>
          )}
        />
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2 text-sm">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span>{value}</span>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}
