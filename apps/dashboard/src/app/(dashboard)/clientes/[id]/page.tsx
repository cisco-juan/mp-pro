import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ClienteEstadoBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getClienteById,
  getVehiculosByClienteId,
  getCitasByClienteId,
  getOrdenesByClienteId,
  ordenEstadoLabels,
  citaEstadoLabels,
} from '@/lib/mock-data';
import { CitaEstadoBadge, OrdenEstadoBadge } from '@/components/shared/status-badge';
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
  const ordenesCliente = getOrdenesByClienteId(id);

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
        <TabsList>
          <TabsTrigger value="vehiculos">Vehículos ({vehiculosCliente.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="vehiculos" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Km</TableHead>
                    <TableHead>Próximo mant.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiculosCliente.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono font-medium">{v.matricula}</TableCell>
                      <TableCell>
                        {v.marca} {v.modelo} ({v.anio})
                      </TableCell>
                      <TableCell className="font-mono">
                        {v.kilometraje.toLocaleString('es-ES')}
                      </TableCell>
                      <TableCell>{formatDisplayDate(v.proximoMantenimiento)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Citas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {citasCliente.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{c.servicio}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDisplayDate(c.fecha)} · {c.hora}
                      </p>
                    </div>
                    <CitaEstadoBadge
                      estado={c.estado}
                      label={citaEstadoLabels[c.estado]}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Órdenes de trabajo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {ordenesCliente.map((o) => (
                  <Link
                    key={o.id}
                    href={`/mantenimiento/${o.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-mono font-medium">{o.numero}</p>
                      <p className="text-xs text-muted-foreground">{o.descripcion}</p>
                    </div>
                    <OrdenEstadoBadge
                      estado={o.estado}
                      label={ordenEstadoLabels[o.estado]}
                    />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
