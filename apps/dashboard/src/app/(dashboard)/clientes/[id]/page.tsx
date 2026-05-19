import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import {
  ClienteEstadoBadge,
  CitaEstadoBadge,
  OrdenComercialEstadoBadge,
  OrdenComercialTipoBadge,
  OrdenEstadoBadge,
  OrdenTrabajoTipoBadge,
  PagoMetodoBadge,
} from '@/components/shared/status-badge';
import { ClienteVehiculosTable } from '@/components/clientes/cliente-vehiculos-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getClienteById,
  getVehiculosByClienteId,
  getCitasByClienteId,
  getOrdenesTrabajoByClienteId,
  getOrdenesComercialesByClienteId,
  getPagosByClienteId,
  getOrdenComercialById,
  getServicioNombre,
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
  citaEstadoLabels,
  ordenComercialTipoLabels,
  getOrdenComercialEstadoLabel,
  pagoMetodoLabels,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const cliente = getClienteById(id);
  return { title: cliente ? cliente.nombre : 'Cliente' };
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params;
  const cliente = getClienteById(id);

  if (!cliente) {
    notFound();
  }

  const vehiculosCliente = getVehiculosByClienteId(id);
  const citasCliente = getCitasByClienteId(id);
  const ordenesTrabajoCliente = getOrdenesTrabajoByClienteId(id);
  const ordenesComercialesCliente = getOrdenesComercialesByClienteId(id);
  const pagosCliente = getPagosByClienteId(id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={cliente.nombre}
        description={cliente.empresa ?? 'Cliente particular'}
        actions={
          <Button variant="outline" asChild>
            <Link href="/clientes">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Información de contacto</CardTitle>
                <CardDescription>Datos principales del cliente</CardDescription>
              </div>
              <ClienteEstadoBadge activo={cliente.estado === 'activo'} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              {cliente.email}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              {cliente.telefono}
            </div>
            {cliente.notas && (
              <p className="mt-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                {cliente.notas}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehículos</span>
              <span className="font-semibold">{cliente.vehiculosCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última visita</span>
              <span>{formatDisplayDate(cliente.ultimaVisita)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehiculos">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="vehiculos">Vehículos ({vehiculosCliente.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="taller">Taller ({ordenesTrabajoCliente.length})</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes ({ordenesComercialesCliente.length})</TabsTrigger>
          <TabsTrigger value="pagos">Pagos ({pagosCliente.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="vehiculos" className="mt-4">
          <ClienteVehiculosTable data={vehiculosCliente} />
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Citas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {citasCliente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin citas registradas</p>
              ) : (
                citasCliente.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{getServicioNombre(c.servicioId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDisplayDate(c.fecha)} · {c.hora}
                      </p>
                    </div>
                    <CitaEstadoBadge estado={c.estado} label={citaEstadoLabels[c.estado]} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="taller" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Órdenes de trabajo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {ordenesTrabajoCliente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin trabajos registrados</p>
              ) : (
                ordenesTrabajoCliente.map((o) => (
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
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ordenes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cotizaciones y facturas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {ordenesComercialesCliente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin órdenes comerciales</p>
              ) : (
                ordenesComercialesCliente.map((o) => (
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
                      <span className="font-mono text-sm">{o.total.toLocaleString('es-ES')} €</span>
                      <OrdenComercialEstadoBadge
                        tipo={o.tipo}
                        estado={o.estado}
                        label={getOrdenComercialEstadoLabel(o)}
                      />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pagos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {pagosCliente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
              ) : (
                pagosCliente.map((p) => {
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
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
