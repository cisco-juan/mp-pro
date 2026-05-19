'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCitasStore } from '@/lib/citas/citas-store';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import { useTallerStore } from '@/lib/taller/taller-store';
import { MOCK_TODAY } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

type ActividadItem = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  href?: string;
};

export function ActividadReciente() {
  const { citas } = useCitasStore();
  const { clientes, getClienteNombre } = useClientesStore();
  const { ordenesTrabajo } = useTallerStore();
  const { ordenesComerciales, pagos } = useOrdenesComercialesStore();

  const actividad = useMemo(() => {
    const items: ActividadItem[] = [];

    for (const pago of pagos.filter((p) => p.monto > 0)) {
      const orden = ordenesComerciales.find((o) => o.id === pago.ordenComercialId);
      items.push({
        id: `pago-${pago.id}`,
        titulo: 'Pago registrado',
        descripcion: orden
          ? `${pago.monto.toLocaleString('es-ES')} € · ${orden.numero}`
          : `${pago.monto.toLocaleString('es-ES')} €`,
        fecha: pago.fecha,
        href: '/pagos',
      });
    }

    for (const cita of citas) {
      if (cita.fecha >= MOCK_TODAY) {
        items.push({
          id: `cita-${cita.id}`,
          titulo: 'Cita programada',
          descripcion: `${getClienteNombre(cita.clienteId)} · ${cita.hora}`,
          fecha: cita.fecha,
          href: `/citas/${cita.id}`,
        });
      }
    }

    for (const orden of ordenesTrabajo) {
      const ultimo = orden.timeline[orden.timeline.length - 1];
      if (ultimo) {
        items.push({
          id: `ot-${orden.id}-${ultimo.fecha}`,
          titulo: `OT ${orden.numero}`,
          descripcion: ultimo.nota,
          fecha: ultimo.fecha,
          href: `/taller/${orden.id}`,
        });
      }
    }

    for (const cliente of clientes.filter((c) => c.ultimaVisita >= MOCK_TODAY)) {
      items.push({
        id: `cliente-${cliente.id}`,
        titulo: 'Cliente actualizado',
        descripcion: cliente.nombre,
        fecha: cliente.ultimaVisita,
        href: `/clientes/${cliente.id}`,
      });
    }

    return items
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 8);
  }, [
    pagos,
    ordenesComerciales,
    citas,
    ordenesTrabajo,
    clientes,
    getClienteNombre,
  ]);

  if (actividad.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin actividad reciente
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Actividad</TableHead>
          <TableHead>Detalle</TableHead>
          <TableHead className="text-right">Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actividad.map((item) => (
          <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
            <TableCell className="font-medium">
              {item.href ? (
                <Link href={item.href} className="text-primary hover:underline">
                  {item.titulo}
                </Link>
              ) : (
                item.titulo
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{item.descripcion}</TableCell>
            <TableCell className="text-right font-mono text-sm text-muted-foreground">
              {formatDisplayDate(item.fecha)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
