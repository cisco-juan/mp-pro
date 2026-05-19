'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Search, UserCheck, UserX } from 'lucide-react';
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
import { ClienteEditSheet } from '@/components/clientes/cliente-edit-sheet';
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
import { ClienteEstadoBadge } from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { ClienteForm } from '@/components/clientes/cliente-form';
import { usePagination } from '@/hooks/use-pagination';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import type { Cliente, ClienteFormValues } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

export function ClientesTable() {
  const { clientes, vehiculos, createCliente, updateCliente, toggleClienteEstado } =
    useClientesStore();

  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroVehiculos, setFiltroVehiculos] = useState('todos');
  const [openCreate, setOpenCreate] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Cliente | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return clientes.filter((c) => {
      const clienteVehiculos = vehiculos.filter((v) => v.clienteId === c.id);
      const matchesSearch =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telefono.includes(q) ||
        (c.telefonoSecundario?.includes(q) ?? false) ||
        c.empresa?.toLowerCase().includes(q) ||
        clienteVehiculos.some((v) => v.matricula.toLowerCase().includes(q));

      const matchesEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && c.estado === 'activo') ||
        (filtroEstado === 'inactivo' && c.estado === 'inactivo');

      const matchesVehiculos =
        filtroVehiculos === 'todos' ||
        (filtroVehiculos === 'con' && c.vehiculosCount > 0) ||
        (filtroVehiculos === 'sin' && c.vehiculosCount === 0);

      return matchesSearch && matchesEstado && matchesVehiculos;
    });
  }, [clientes, vehiculos, search, filtroEstado, filtroVehiculos]);

  const resetKey = `${search}-${filtroEstado}-${filtroVehiculos}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  function handleCreate(values: ClienteFormValues) {
    const created = createCliente(values);
    if (created) {
      toast.success('Cliente creado', {
        description: values.registrarVehiculo
          ? `${created.nombre} y su vehículo se han registrado.`
          : `${created.nombre} se ha registrado correctamente.`,
      });
      setOpenCreate(false);
    }
  }

  function handleUpdate(values: ClienteFormValues) {
    if (!editingCliente) return;
    const ok = updateCliente(editingCliente.id, values);
    if (ok) {
      toast.success('Cliente actualizado');
      setEditingCliente(null);
    }
  }

  function handleToggle(cliente: Cliente) {
    if (cliente.estado === 'activo') {
      setDeactivateTarget(cliente);
      return;
    }
    const next = toggleClienteEstado(cliente.id);
    if (next) {
      toast.success('Cliente activado');
    }
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    toggleClienteEstado(deactivateTarget.id);
    toast.success('Cliente desactivado', {
      description: `${deactivateTarget.nombre} ya no aparecerá como activo.`,
    });
    setDeactivateTarget(null);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, teléfono, matrícula..."
                className="h-10 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar clientes"
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
            <Select value={filtroVehiculos} onValueChange={setFiltroVehiculos}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Vehículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="con">Con vehículos</SelectItem>
                <SelectItem value="sin">Sin vehículos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="min-h-11 shrink-0">
                <Plus className="size-4" />
                Nuevo cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo cliente</DialogTitle>
                <DialogDescription>
                  Registra un cliente con sus datos de contacto y, si quieres, su primer vehículo.
                </DialogDescription>
              </DialogHeader>
              <ClienteForm
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
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Vehículos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última visita</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((cliente) => (
                  <TableRow key={cliente.id} className="transition-colors hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <p className="font-medium">{cliente.nombre}</p>
                        {cliente.empresa && (
                          <p className="text-xs text-muted-foreground">{cliente.empresa}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{cliente.email}</p>
                      <p className="text-xs text-muted-foreground">{cliente.telefono}</p>
                    </TableCell>
                    <TableCell className="font-mono">{cliente.vehiculosCount}</TableCell>
                    <TableCell>
                      <ClienteEstadoBadge activo={cliente.estado === 'activo'} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDisplayDate(cliente.ultimaVisita)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9" asChild>
                              <Link href={`/clientes/${cliente.id}`} aria-label="Ver detalle">
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
                              className="size-9"
                              onClick={() => setEditingCliente(cliente)}
                              aria-label="Editar cliente"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar cliente</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9"
                              onClick={() => handleToggle(cliente)}
                              aria-label={
                                cliente.estado === 'activo'
                                  ? 'Desactivar cliente'
                                  : 'Activar cliente'
                              }
                            >
                              {cliente.estado === 'activo' ? (
                                <UserX className="size-4" />
                              ) : (
                                <UserCheck className="size-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {cliente.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableShell>

        <ClienteEditSheet
          open={editingCliente !== null}
          onOpenChange={(open) => !open && setEditingCliente(null)}
          cliente={editingCliente}
          onSubmit={handleUpdate}
        />

        <Dialog
          open={deactivateTarget !== null}
          onOpenChange={(open) => !open && setDeactivateTarget(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Desactivar cliente</DialogTitle>
              <DialogDescription>
                ¿Desactivar a <strong>{deactivateTarget?.nombre}</strong>? Podrás reactivarlo en
                cualquier momento.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeactivate}>
                Desactivar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
