'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Car, Clock, Pencil, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CitaEditSheet } from '@/components/citas/cita-edit-sheet';
import { CitaEstadoBadge } from '@/components/shared/status-badge';
import { useCitasStore } from '@/lib/citas/citas-store';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useServiciosStore } from '@/lib/servicios/servicios-store';
import { citaEstadoLabels, type CitaEstado, type CitaFormValues } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

interface CitaDetalleViewProps {
  id: string;
}

export function CitaDetalleView({ id }: CitaDetalleViewProps) {
  const { getCita, updateCita, updateCitaEstado, loading } = useCitasStore();
  const { getVehiculoLabel, getClienteNombre } = useClientesStore();
  const { getServicioNombre } = useServiciosStore();
  const cita = getCita(id);

  const [editing, setEditing] = useState(false);
  const [estadoTarget, setEstadoTarget] = useState<CitaEstado | null>(null);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando cita…</p>;
  }

  if (!cita) {
    notFound();
  }

  const citaData = cita;
  const canEdit = citaData.estado !== 'completada' && citaData.estado !== 'cancelada';

  async function handleUpdate(values: CitaFormValues) {
    const ok = await updateCita(citaData.id, values);
    if (ok) {
      toast.success('Cita actualizada');
      setEditing(false);
    } else {
      toast.error('No se pudo actualizar la cita');
    }
  }

  async function handleEstadoChange(estado: CitaEstado) {
    const ok = await updateCitaEstado(citaData.id, estado);
    if (ok) {
      toast.success(`Cita ${citaEstadoLabels[estado].toLowerCase()}`);
    } else {
      toast.error('No se pudo actualizar el estado');
    }
    setEstadoTarget(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild className="min-h-10">
          <Link href="/citas">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>

        {canEdit && (
          <Button variant="outline" className="min-h-10" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            Editar
          </Button>
        )}

        {citaData.estado === 'pendiente' && (
          <Button className="min-h-10" onClick={() => setEstadoTarget('confirmada')}>
            Confirmar cita
          </Button>
        )}

        {citaData.estado === 'confirmada' && (
          <Button className="min-h-10" onClick={() => setEstadoTarget('completada')}>
            Marcar completada
          </Button>
        )}

        {(citaData.estado === 'pendiente' || citaData.estado === 'confirmada') && (
          <Button
            variant="destructive"
            className="min-h-10"
            onClick={() => setEstadoTarget('cancelada')}
          >
            Cancelar cita
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CitaEstadoBadge
                estado={citaData.estado}
                label={citaEstadoLabels[citaData.estado]}
              />
            </div>
            <CardTitle className="text-xl">{getServicioNombre(citaData.servicioId)}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha y hora</p>
                <p className="font-medium">
                  {formatDisplayDate(citaData.fecha)} ·{' '}
                  <span className="font-mono">{citaData.hora}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duración</p>
                <p className="font-medium">{citaData.duracionMin} minutos</p>
              </div>
            </div>

            <div className="flex gap-3">
              <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <Link
                  href={`/clientes/${citaData.clienteId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {getClienteNombre(citaData.clienteId)}
                </Link>
              </div>
            </div>

            <div className="flex gap-3">
              <Car className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Vehículo</p>
                <Link
                  href={`/vehiculos/${citaData.vehiculoId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {getVehiculoLabel(citaData.vehiculoId)}
                </Link>
              </div>
            </div>

            {citaData.notas && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="mt-1 text-sm">{citaData.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">ID</p>
              <p className="font-mono">{citaData.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Servicio</p>
              <p className="font-medium">{getServicioNombre(citaData.servicioId)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <div className="mt-1">
                <CitaEstadoBadge
                  estado={citaData.estado}
                  label={citaEstadoLabels[citaData.estado]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CitaEditSheet
        open={editing}
        onOpenChange={setEditing}
        cita={citaData}
        onSubmit={handleUpdate}
      />

      <Dialog open={Boolean(estadoTarget)} onOpenChange={(open) => !open && setEstadoTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogDescription>
              {estadoTarget &&
                `¿Marcar esta cita como ${citaEstadoLabels[estadoTarget].toLowerCase()}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEstadoTarget(null)} className="min-h-10">
              Cancelar
            </Button>
            <Button
              onClick={() => estadoTarget && handleEstadoChange(estadoTarget)}
              className="min-h-10"
              variant={estadoTarget === 'cancelada' ? 'destructive' : 'default'}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
