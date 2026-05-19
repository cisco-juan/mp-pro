'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CitaEditSheet } from '@/components/citas/cita-edit-sheet';
import { CitaForm } from '@/components/citas/cita-form';
import { CitaEstadoBadge } from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import { useCitasStore } from '@/lib/citas/citas-store';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useServiciosStore } from '@/lib/servicios/servicios-store';
import {
  citaEstadoLabels,
  type Cita,
  type CitaEstado,
  type CitaFormValues,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

interface CitasTableProps {
  openCreate?: boolean;
  onOpenCreateChange?: (open: boolean) => void;
  hideCreateButton?: boolean;
}

export function CitasTable({
  openCreate,
  onOpenCreateChange,
  hideCreateButton = false,
}: CitasTableProps) {
  const { citas, createCita, updateCita, updateCitaEstado } = useCitasStore();
  const { getVehiculoLabel, getClienteNombre, vehiculos } = useClientesStore();
  const { getServicioNombre } = useServiciosStore();

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [internalOpenCreate, setInternalOpenCreate] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [estadoTarget, setEstadoTarget] = useState<{
    cita: Cita;
    estado: CitaEstado;
    label: string;
  } | null>(null);

  const isCreateControlled = onOpenCreateChange !== undefined;
  const openCreateDialog = openCreate ?? internalOpenCreate;

  function setOpenCreateDialog(open: boolean) {
    if (onOpenCreateChange) {
      onOpenCreateChange(open);
    } else {
      setInternalOpenCreate(open);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return citas.filter((c) => {
      const clienteNombre = getClienteNombre(c.clienteId).toLowerCase();
      const servicioNombre = getServicioNombre(c.servicioId).toLowerCase();
      const vehiculo = vehiculos.find((v) => v.id === c.vehiculoId);
      const matricula = vehiculo?.matricula.toLowerCase() ?? '';

      const matchesSearch =
        !q ||
        clienteNombre.includes(q) ||
        servicioNombre.includes(q) ||
        matricula.includes(q) ||
        c.fecha.includes(q);

      const matchesEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
      const matchesDesde = !fechaDesde || c.fecha >= fechaDesde;
      const matchesHasta = !fechaHasta || c.fecha <= fechaHasta;

      return matchesSearch && matchesEstado && matchesDesde && matchesHasta;
    });
  }, [citas, search, filtroEstado, fechaDesde, fechaHasta, vehiculos]);

  const citasOrdenadas = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)
      ),
    [filtered]
  );

  const resetKey = `${search}-${filtroEstado}-${fechaDesde}-${fechaHasta}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: citasOrdenadas,
    resetKey,
  });

  async function handleCreate(values: CitaFormValues) {
    const cita = await createCita(values);
    if (!cita) {
      toast.error('No se pudo crear la cita');
      return;
    }
    toast.success('Cita creada');
    setOpenCreateDialog(false);
  }

  async function handleUpdate(values: CitaFormValues) {
    if (!editingCita) return;
    const ok = await updateCita(editingCita.id, values);
    if (ok) {
      toast.success('Cita actualizada');
      setEditingCita(null);
    } else {
      toast.error('No se pudo actualizar la cita');
    }
  }

  async function handleConfirmEstadoChange() {
    if (!estadoTarget) return;
    const ok = await updateCitaEstado(estadoTarget.cita.id, estadoTarget.estado);
    if (ok) {
      toast.success(`Cita ${estadoTarget.label.toLowerCase()}`);
    } else {
      toast.error('No se pudo actualizar el estado');
    }
    setEstadoTarget(null);
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, servicio, matrícula..."
                className="h-10 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar citas"
              />
            </div>

            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="h-10 w-full sm:w-[160px]" aria-label="Filtrar por estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-1">
              <Label htmlFor="fechaDesde" className="sr-only">
                Desde
              </Label>
              <Input
                id="fechaDesde"
                type="date"
                className="h-10 w-full sm:w-[150px]"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                aria-label="Filtrar desde fecha"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="fechaHasta" className="sr-only">
                Hasta
              </Label>
              <Input
                id="fechaHasta"
                type="date"
                className="h-10 w-full sm:w-[150px]"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                aria-label="Filtrar hasta fecha"
              />
            </div>
          </div>

          {!hideCreateButton && !isCreateControlled && (
            <Button className="min-h-10" onClick={() => setOpenCreateDialog(true)}>
              <Plus className="size-4" />
              Nueva cita
            </Button>
          )}
        </div>

        <DataTableShell
          footer={
            <TablePagination
              page={page}
              totalPages={totalPages}
              rangeLabel={rangeLabel}
              onPageChange={setPage}
            />
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[140px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No se encontraron citas
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((cita) => (
                  <TableRow key={cita.id} className="transition-colors hover:bg-muted/40">
                    <TableCell>{formatDisplayDate(cita.fecha)}</TableCell>
                    <TableCell className="font-mono">{cita.hora}</TableCell>
                    <TableCell>{getClienteNombre(cita.clienteId)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {getVehiculoLabel(cita.vehiculoId)}
                    </TableCell>
                    <TableCell>{getServicioNombre(cita.servicioId)}</TableCell>
                    <TableCell>
                      <CitaEstadoBadge
                        estado={cita.estado}
                        label={citaEstadoLabels[cita.estado]}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9" asChild>
                              <Link href={`/citas/${cita.id}`} aria-label="Ver detalle">
                                <Eye className="size-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalle</TooltipContent>
                        </Tooltip>

                        {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                                onClick={() => setEditingCita(cita)}
                                aria-label="Editar cita"
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar cita</TooltipContent>
                          </Tooltip>
                        )}

                        {cita.estado === 'pendiente' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                                onClick={() =>
                                  setEstadoTarget({
                                    cita,
                                    estado: 'confirmada',
                                    label: 'Confirmada',
                                  })
                                }
                                aria-label="Confirmar cita"
                              >
                                <CheckCircle2 className="size-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Confirmar</TooltipContent>
                          </Tooltip>
                        )}

                        {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                          <>
                            {cita.estado === 'confirmada' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-9"
                                    onClick={() =>
                                      setEstadoTarget({
                                        cita,
                                        estado: 'completada',
                                        label: 'Completada',
                                      })
                                    }
                                    aria-label="Completar cita"
                                  >
                                    <CheckCircle2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Completar</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-9"
                                  onClick={() =>
                                    setEstadoTarget({
                                      cita,
                                      estado: 'cancelada',
                                      label: 'Cancelada',
                                    })
                                  }
                                  aria-label="Cancelar cita"
                                >
                                  <XCircle className="size-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableShell>

        <Dialog open={openCreateDialog && !isCreateControlled} onOpenChange={setOpenCreateDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva cita</DialogTitle>
              <DialogDescription>
                Programa una cita para un cliente y vehículo del taller.
              </DialogDescription>
            </DialogHeader>
            <CitaForm
              key={String(openCreateDialog)}
              mode="create"
              onSubmit={handleCreate}
              onCancel={() => setOpenCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        <CitaEditSheet
          open={Boolean(editingCita)}
          onOpenChange={(open) => !open && setEditingCita(null)}
          cita={editingCita}
          onSubmit={handleUpdate}
        />

        <Dialog open={Boolean(estadoTarget)} onOpenChange={(open) => !open && setEstadoTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar estado de la cita</DialogTitle>
              <DialogDescription>
                {estadoTarget &&
                  `¿Marcar la cita de ${getClienteNombre(estadoTarget.cita.clienteId)} como ${estadoTarget.label.toLowerCase()}?`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEstadoTarget(null)} className="min-h-10">
                Cancelar
              </Button>
              <Button onClick={handleConfirmEstadoChange} className="min-h-10">
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
