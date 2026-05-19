'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { UrgenciaBadge } from '@/components/shared/status-badge';
import { VehiculoEditSheet } from '@/components/vehiculos/vehiculo-edit-sheet';
import { VehiculoForm } from '@/components/vehiculos/vehiculo-form';
import { usePagination } from '@/hooks/use-pagination';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import type { Vehiculo, VehiculoFormValues } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

interface ClienteVehiculosTableProps {
  clienteId: string;
  data: Vehiculo[];
}

export function ClienteVehiculosTable({ clienteId, data }: ClienteVehiculosTableProps) {
  const { createVehiculo, updateVehiculo } = useClientesStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);

  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: data,
  });

  function handleCreate(values: VehiculoFormValues) {
    const created = createVehiculo({ ...values, clienteId });
    if (created) {
      toast.success('Vehículo añadido');
      setOpenCreate(false);
    } else {
      toast.error('No se pudo registrar el vehículo');
    }
  }

  function handleUpdate(values: VehiculoFormValues) {
    if (!editingVehiculo) return;
    const ok = updateVehiculo(editingVehiculo.id, values);
    if (ok) {
      toast.success('Vehículo actualizado');
      setEditingVehiculo(null);
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                Añadir vehículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo vehículo</DialogTitle>
                <DialogDescription>
                  Registra un vehículo para este cliente.
                </DialogDescription>
              </DialogHeader>
              <VehiculoForm
                mode="create"
                defaultClienteId={clienteId}
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
                <TableHead>Km</TableHead>
                <TableHead>Próximo mant.</TableHead>
                <TableHead>Urgencia</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Sin vehículos registrados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">
                      <Link
                        href={`/vehiculos/${v.id}`}
                        className="text-primary hover:underline"
                      >
                        {v.matricula}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {v.marca} {v.modelo} ({v.anio})
                    </TableCell>
                    <TableCell className="font-mono">
                      {v.kilometraje.toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell>{formatDisplayDate(v.proximoMantenimiento)}</TableCell>
                    <TableCell>
                      <UrgenciaBadge urgencia={v.urgencia} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" asChild>
                              <Link href={`/vehiculos/${v.id}`} aria-label="Ver detalle">
                                <Eye className="size-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalle</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => setEditingVehiculo(v)}
                              aria-label="Editar"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar vehículo</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
      </div>
    </TooltipProvider>
  );
}
