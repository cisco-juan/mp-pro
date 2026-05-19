import Link from 'next/link';
import {
  Euro,
  Package,
  Wrench,
  ArrowRight,
  FileText,
  Shield,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { AppointmentsChart } from '@/components/dashboard/appointments-chart';
import { CitasHoyStat } from '@/components/citas/citas-hoy-stat';
import { ProximasCitasCard } from '@/components/citas/proximas-citas-card';
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
import { actividadReciente, dashboardStats } from '@/lib/mock-data';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
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
        <CitasHoyStat />
        <StatCard
          title="OTs abiertas"
          value={String(dashboardStats.otsAbiertas)}
          trend={dashboardStats.otsAbiertasTrend}
          icon={Wrench}
          trendPositive={false}
        />
        <StatCard
          title="Stock bajo"
          value={String(dashboardStats.piezasStockBajo)}
          trend={`${dashboardStats.facturasPendientes} fact. pend.`}
          icon={Package}
          trendPositive={false}
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
        <ProximasCitasCard />
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
          { href: '/taller', label: 'Taller', desc: 'Trabajos en curso', icon: Wrench },
          { href: '/inventario', label: 'Inventario', desc: 'Piezas y stock', icon: Package },
          { href: '/ordenes', label: 'Órdenes', desc: 'Cotizaciones y facturas', icon: FileText },
          { href: '/usuarios', label: 'Usuarios', desc: 'Acceso y roles', icon: Shield },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <link.icon className="mb-2 size-5 text-muted-foreground group-hover:text-primary" />
            <p className="font-medium group-hover:text-primary">{link.label}</p>
            <p className="text-sm text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
