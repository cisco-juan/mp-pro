'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Ban, Car, Eye, Pencil, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  UrgenciaBadge,
  VehiculoEstadoBadge,
} from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { VehiculoEditSheet } from '@/components/vehiculos/vehiculo-edit-sheet';
import { VehiculoForm } from '@/components/vehiculos/vehiculo-form';
import { usePagination } from '@/hooks/use-pagination';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import type { Vehiculo, VehiculoFormValues } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

export function VehiculosTable() {
  const {
    vehiculos,
    clientes,
    getCliente,
    createVehiculo,
    updateVehiculo,
    toggleVehiculoEstado,
  } = useClientesStore();

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');
  const [openCreate, setOpenCreate] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Vehiculo | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return vehiculos.filter((v) => {
      const cliente = getCliente(v.clienteId);
      const matchesSearch =
        !q ||
        v.matricula.toLowerCase().includes(q) ||
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        (cliente?.nombre.toLowerCase().includes(q) ?? false) ||
        (cliente?.empresa?.toLowerCase().includes(q) ?? false);

      const matchesEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && v.estado === 'activo') ||
        (filtroEstado === 'inactivo' && v.estado === 'inactivo');

      const matchesUrgencia =
        filtroUrgencia === 'todos' || v.urgencia === filtroUrgencia;

      return matchesSearch && matchesEstado && matchesUrgencia;
    });
  }, [vehiculos, search, filtroEstado, filtroUrgencia, getCliente]);

  const resetKey = `${search}-${filtroEstado}-${filtroUrgencia}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  function handleCreate(values: VehiculoFormValues) {
    const created = createVehiculo(values);
    if (created) {
      toast.success('Vehículo registrado', {
        description: `${created.marca} ${created.modelo} (${created.matricula})`,
      });
      setOpenCreate(false);
    } else {
      toast.error('No se pudo registrar', {
        description: 'Comprueba que la matrícula no esté duplicada.',
      });
    }
  }

  function handleUpdate(values: VehiculoFormValues) {
    if (!editingVehiculo) return;
    const ok = updateVehiculo(editingVehiculo.id, values);
    if (ok) {
      toast.success('Vehículo actualizado');
      setEditingVehiculo(null);
    } else {
      toast.error('No se pudo actualizar', {
        description: 'Comprueba que la matrícula no esté duplicada.',
      });
    }
  }

  function handleToggle(vehiculo: Vehiculo) {
    if (vehiculo.estado === 'activo') {
      setDeactivateTarget(vehiculo);
      return;
    }
    toggleVehiculoEstado(vehiculo.id);
    toast.success('Vehículo activado');
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    toggleVehiculoEstado(deactivateTarget.id);
    toast.success('Vehículo dado de baja', {
      description: `${deactivateTarget.matricula} ya no aparecerá como activo.`,
    });
    setDeactivateTarget(null);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <div className="relative max-w-sm flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por matrícula, marca, modelo, cliente..."
                className="h-10 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar vehículos"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroUrgencia} onValueChange={setFiltroUrgencia}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Mantenimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Toda urgencia</SelectItem>
                <SelectItem value="ok">Al día</SelectItem>
                <SelectItem value="proximo">Próximo</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="min-h-11 shrink-0">
                <Plus className="size-4" />
                Nuevo vehículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo vehículo</DialogTitle>
                <DialogDescription>
                  Registra un vehículo y asígnalo a un cliente existente.
                </DialogDescription>
              </DialogHeader>
              <VehiculoForm
                mode="create"
                onSubmit={handleCreate}
                onCancel={() => setOpenCreate(false)}
              />
            </DialogContent>
          </Dialog>
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
                <TableHead>Matrícula</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Kilometraje</TableHead>
                <TableHead>Próximo servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mantenimiento</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No se encontraron vehículos
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((v) => {
                  const cliente = clientes.find((c) => c.id === v.clienteId);
                  return (
                    <TableRow key={v.id} className="transition-colors hover:bg-muted/40">
                      <TableCell className="font-mono font-medium">{v.matricula}</TableCell>
                      <TableCell>
                        {v.marca} {v.modelo}
                        <span className="ml-1 text-xs text-muted-foreground">({v.anio})</span>
                      </TableCell>
                      <TableCell>
                        {cliente ? (
                          <Link
                            href={`/clientes/${v.clienteId}`}
                            className="text-primary hover:underline"
                          >
                            {cliente.nombre}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {v.kilometraje.toLocaleString('es-ES')} km
                      </TableCell>
                      <TableCell>{formatDisplayDate(v.proximoMantenimiento)}</TableCell>
                      <TableCell>
                        <VehiculoEstadoBadge activo={v.estado === 'activo'} />
                      </TableCell>
                      <TableCell>
                        <UrgenciaBadge urgencia={v.urgencia} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-9" asChild>
                                <Link href={`/vehiculos/${v.id}`} aria-label="Ver detalle">
                                  <Eye className="size-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalle del vehículo</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                                onClick={() => setEditingVehiculo(v)}
                                aria-label="Editar vehículo"
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar datos del vehículo</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                                onClick={() => handleToggle(v)}
                                aria-label={
                                  v.estado === 'activo'
                                    ? 'Dar de baja vehículo'
                                    : 'Activar vehículo'
                                }
                              >
                                {v.estado === 'activo' ? (
                                  <Ban className="size-4" />
                                ) : (
                                  <Car className="size-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {v.estado === 'activo' ? 'Dar de baja vehículo' : 'Activar vehículo'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </DataTableShell>

        <VehiculoEditSheet
          open={editingVehiculo !== null}
          onOpenChange={(open) => !open && setEditingVehiculo(null)}
          vehiculo={editingVehiculo}
          onSubmit={handleUpdate}
        />

        <Dialog
          open={deactivateTarget !== null}
          onOpenChange={(open) => !open && setDeactivateTarget(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Dar de baja vehículo</DialogTitle>
              <DialogDescription>
                ¿Dar de baja <strong>{deactivateTarget?.matricula}</strong> (
                {deactivateTarget?.marca} {deactivateTarget?.modelo})? Podrás reactivarlo en
                cualquier momento.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeactivate}>
                Dar de baja
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

