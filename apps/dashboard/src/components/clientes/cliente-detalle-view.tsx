'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Car,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserCheck,
  UserX,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClienteEditSheet } from '@/components/clientes/cliente-edit-sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClienteVehiculosTable } from '@/components/clientes/cliente-vehiculos-table';
import { PaginatedList } from '@/components/shared/paginated-list';
import {
  ClienteEstadoBadge,
  CitaEstadoBadge,
  OrdenComercialEstadoBadge,
  OrdenComercialTipoBadge,
  OrdenEstadoBadge,
  OrdenTrabajoTipoBadge,
  PagoMetodoBadge,
} from '@/components/shared/status-badge';
import {
  formatClienteDireccion,
  getClienteIniciales,
  useClientesStore,
  type ClientesContextValue,
} from '@/lib/clientes/clientes-store';
import type { Cliente } from '@/lib/mock-data';
import {
  documentoTipoLabels,
  getOrdenComercialById,
  getOrdenesComercialesByClienteId,
  getOrdenesTrabajoByClienteId,
  getPagosByClienteId,
  getServicioNombre,
  citaEstadoLabels,
  ordenComercialTipoLabels,
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
  pagoMetodoLabels,
  getOrdenComercialEstadoLabel,
  type ClienteFormValues,
} from '@/lib/mock-data';
import { useCitasStore } from '@/lib/citas/citas-store';
import { formatDisplayDate } from '@org/utils-shared';

interface ClienteDetalleViewProps {
  id: string;
}

export function ClienteDetalleView({ id }: ClienteDetalleViewProps) {
  const { getCliente, getVehiculosByCliente, updateCliente, toggleClienteEstado } =
    useClientesStore();
  const clienteOrNull = getCliente(id);

  if (!clienteOrNull) {
    notFound();
  }

  const cliente = clienteOrNull;

  return (
    <ClienteDetalleContent
      id={id}
      cliente={cliente}
      getVehiculosByCliente={getVehiculosByCliente}
      updateCliente={updateCliente}
      toggleClienteEstado={toggleClienteEstado}
    />
  );
}

function ClienteDetalleContent({
  id,
  cliente,
  getVehiculosByCliente,
  updateCliente,
  toggleClienteEstado,
}: {
  id: string;
  cliente: Cliente;
  getVehiculosByCliente: ClientesContextValue['getVehiculosByCliente'];
  updateCliente: ClientesContextValue['updateCliente'];
  toggleClienteEstado: ClientesContextValue['toggleClienteEstado'];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDeactivate, setOpenDeactivate] = useState(false);

  const { getCitasByCliente } = useCitasStore();

  const vehiculosCliente = getVehiculosByCliente(id);
  const citasCliente = getCitasByCliente(id);
  const ordenesTrabajoCliente = getOrdenesTrabajoByClienteId(id);
  const ordenesComercialesCliente = getOrdenesComercialesByClienteId(id);
  const pagosCliente = getPagosByClienteId(id);

  const direccionFormateada = formatClienteDireccion(cliente.direccion);
  const documentoLabel = cliente.documento
    ? `${documentoTipoLabels[cliente.documento.tipo]} ${cliente.documento.numero}`
    : null;

  function handleUpdate(values: ClienteFormValues) {
    const ok = updateCliente(id, values);
    if (ok) {
      toast.success('Cliente actualizado');
      setOpenEdit(false);
    }
  }

  function handleToggle() {
    if (cliente.estado === 'activo') {
      setOpenDeactivate(true);
      return;
    }
    toggleClienteEstado(id);
    toast.success('Cliente activado');
  }

  function confirmDeactivate() {
    toggleClienteEstado(id);
    toast.success('Cliente desactivado');
    setOpenDeactivate(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-14" size="lg">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {getClienteIniciales(cliente.nombre)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{cliente.nombre}</h1>
              <ClienteEstadoBadge activo={cliente.estado === 'activo'} />
            </div>
            <p className="text-muted-foreground">
              {cliente.empresa ?? 'Cliente particular'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/clientes">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setOpenEdit(true)}>
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button
            variant={cliente.estado === 'activo' ? 'outline' : 'default'}
            onClick={handleToggle}
          >
            {cliente.estado === 'activo' ? (
              <>
                <UserX className="size-4" />
                Desactivar
              </>
            ) : (
              <>
                <UserCheck className="size-4" />
                Activar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Información de contacto</CardTitle>
            <CardDescription>Datos principales del cliente</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ContactRow icon={Mail} label="Email" value={cliente.email} />
            <ContactRow icon={Phone} label="Teléfono principal" value={cliente.telefono} />
            {cliente.telefonoSecundario && (
              <ContactRow
                icon={Phone}
                label="Teléfono secundario"
                value={cliente.telefonoSecundario}
              />
            )}
            {cliente.empresa && (
              <ContactRow icon={Building2} label="Empresa" value={cliente.empresa} />
            )}
            {direccionFormateada && (
              <ContactRow
                icon={MapPin}
                label="Dirección"
                value={direccionFormateada}
                className="sm:col-span-2"
              />
            )}
            {documentoLabel && (
              <ContactRow
                icon={FileText}
                label="Documento"
                value={documentoLabel}
                className="sm:col-span-2"
              />
            )}
            {cliente.notas && (
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Notas</p>
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {cliente.notas}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <SummaryRow icon={Car} label="Vehículos" value={String(cliente.vehiculosCount)} />
            <SummaryRow
              icon={Calendar}
              label="Última visita"
              value={formatDisplayDate(cliente.ultimaVisita)}
            />
            <SummaryRow icon={Calendar} label="Citas" value={String(citasCliente.length)} />
            <SummaryRow
              icon={Wrench}
              label="Órdenes taller"
              value={String(ordenesTrabajoCliente.length)}
            />
            <SummaryRow
              icon={FileText}
              label="Cotiz. / facturas"
              value={String(ordenesComercialesCliente.length)}
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehiculos">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="vehiculos">Vehículos ({vehiculosCliente.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({citasCliente.length})</TabsTrigger>
          <TabsTrigger value="taller">Taller ({ordenesTrabajoCliente.length})</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes ({ordenesComercialesCliente.length})</TabsTrigger>
          <TabsTrigger value="pagos">Pagos ({pagosCliente.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vehiculos" className="mt-4">
          <ClienteVehiculosTable clienteId={id} data={vehiculosCliente} />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={citasCliente}
                emptyMessage="Sin citas registradas"
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

        <TabsContent value="taller" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Órdenes de trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={ordenesTrabajoCliente}
                emptyMessage="Sin trabajos registrados"
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
        </TabsContent>

        <TabsContent value="ordenes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cotizaciones y facturas</CardTitle>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={ordenesComercialesCliente}
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

        <TabsContent value="pagos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <PaginatedList
                items={pagosCliente}
                emptyMessage="Sin pagos registrados"
                renderItem={(p) => {
                  const orden = getOrdenComercialById(p.ordenComercialId);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <p className="font-mono font-medium">
                          {p.monto.toLocaleString('es-ES')} €
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDisplayDate(p.fecha)} · {orden?.numero ?? '—'}
                        </p>
                      </div>
                      <PagoMetodoBadge
                        metodo={p.metodo}
                        label={pagoMetodoLabels[p.metodo]}
                      />
                    </div>
                  );
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClienteEditSheet
        open={openEdit}
        onOpenChange={setOpenEdit}
        cliente={cliente}
        onSubmit={handleUpdate}
      />

      <Dialog open={openDeactivate} onOpenChange={setOpenDeactivate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desactivar cliente</DialogTitle>
            <DialogDescription>
              ¿Desactivar a <strong>{cliente.nombre}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDeactivate(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Desactivar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
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
