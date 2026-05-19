import Link from 'next/link';
import {
  Calendar,
  Euro,
  Users,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { AppointmentsChart } from '@/components/dashboard/appointments-chart';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  actividadReciente,
  citas,
  dashboardStats,
  getClienteNombre,
  citaEstadoLabels,
} from '@/lib/mock-data';
import { CitaEstadoBadge } from '@/components/shared/status-badge';
import { formatDisplayDate } from '@org/utils-shared';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  const proximasCitas = citas
    .filter((c) => c.estado !== 'completada' && c.estado !== 'cancelada')
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Resumen del día en tu taller"
        actions={
          <Button asChild>
            <Link href="/citas">
              Nueva cita
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Citas hoy"
          value={String(dashboardStats.citasHoy)}
          trend={dashboardStats.citasHoyTrend}
          icon={Calendar}
        />
        <StatCard
          title="OTs abiertas"
          value={String(dashboardStats.otsAbiertas)}
          trend={dashboardStats.otsAbiertasTrend}
          icon={Wrench}
          trendPositive={false}
        />
        <StatCard
          title="Clientes activos"
          value={String(dashboardStats.clientesActivos)}
          trend={dashboardStats.clientesTrend}
          icon={Users}
        />
        <StatCard
          title="Ingresos del mes"
          value={`${dashboardStats.ingresosMes.toLocaleString('es-ES')} €`}
          trend={dashboardStats.ingresosTrend}
          icon={Euro}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AppointmentsChart />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximas citas</CardTitle>
            <CardDescription>Agenda de hoy y próximos días</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {proximasCitas.map((cita) => (
              <div
                key={cita.id}
                className="flex flex-col gap-1 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-medium">{cita.hora}</span>
                  <CitaEstadoBadge
                    estado={cita.estado}
                    label={citaEstadoLabels[cita.estado]}
                  />
                </div>
                <p className="text-sm font-medium">{cita.servicio}</p>
                <p className="text-xs text-muted-foreground">
                  {getClienteNombre(cita.clienteId)} · {formatDisplayDate(cita.fecha)}
                </p>
              </div>
            ))}
            <Button variant="outline" className="mt-2" asChild>
              <Link href="/citas">Ver todas las citas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Últimos movimientos en el taller</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actividad</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actividadReciente.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.titulo}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.descripcion}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {item.fecha}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/clientes', label: 'Clientes', desc: 'Gestionar fichas' },
          { href: '/vehiculos', label: 'Vehículos', desc: 'Flota del taller' },
          { href: '/mantenimiento', label: 'Órdenes', desc: 'Trabajos en curso' },
          { href: '/staff', label: 'Equipo', desc: 'Personal del taller' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <p className="font-medium group-hover:text-primary">{link.label}</p>
            <p className="text-sm text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
