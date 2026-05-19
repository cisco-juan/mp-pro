'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  OrdenEstadoBadge,
  OrdenTrabajoTipoBadge,
} from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import {
  ordenEstadoLabels,
  ordenTrabajoTipoLabels,
  type OrdenEstado,
  type OrdenTrabajoTipo,
} from '@/lib/mock-data';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useTallerStore } from '@/lib/taller/taller-store';
import { useUsuariosStore } from '@/lib/usuarios/usuarios-store';
import { formatDisplayDate } from '@org/utils-shared';

export function OrdenesTrabajoTable() {
  const { ordenesTrabajo } = useTallerStore();
  const { getVehiculoLabel, getClienteNombre } = useClientesStore();
  const { getUsuario } = useUsuariosStore();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ordenesTrabajo.filter((o) => {
      const matchesSearch =
        !q ||
        o.numero.toLowerCase().includes(q) ||
        o.descripcion.toLowerCase().includes(q) ||
        getClienteNombre(o.clienteId).toLowerCase().includes(q) ||
        getVehiculoLabel(o.vehiculoId).toLowerCase().includes(q);

      const matchesEstado = filtroEstado === 'todos' || o.estado === filtroEstado;
      const matchesTipo = filtroTipo === 'todos' || o.tipo === filtroTipo;

      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [search, filtroEstado, filtroTipo, ordenesTrabajo, getVehiculoLabel]);

  const resetKey = `${search}-${filtroEstado}-${filtroTipo}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por OT, cliente, vehículo..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar órdenes de trabajo"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {(Object.keys(ordenTrabajoTipoLabels) as OrdenTrabajoTipo[]).map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {ordenTrabajoTipoLabels[tipo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {(Object.keys(ordenEstadoLabels) as OrdenEstado[]).map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {ordenEstadoLabels[estado]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <TableHead>Nº OT</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Mecánico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha est.</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No se encontraron órdenes de trabajo
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((orden) => {
                const mecanico = orden.usuarioId ? getUsuario(orden.usuarioId) : undefined;

                return (
                  <TableRow key={orden.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-mono font-medium">{orden.numero}</TableCell>
                    <TableCell>
                      <OrdenTrabajoTipoBadge
                        tipo={orden.tipo}
                        label={ordenTrabajoTipoLabels[orden.tipo]}
                      />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{orden.descripcion}</TableCell>
                    <TableCell>{getClienteNombre(orden.clienteId)}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-muted-foreground">
                      {getVehiculoLabel(orden.vehiculoId)}
                    </TableCell>
                    <TableCell className="text-sm">{mecanico?.nombre ?? '—'}</TableCell>
                    <TableCell>
                      <OrdenEstadoBadge
                        estado={orden.estado}
                        label={ordenEstadoLabels[orden.estado]}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDisplayDate(orden.fechaEstimada)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {orden.totalEstimado.toLocaleString('es-ES')} €
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/taller/${orden.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </div>
  );
}
