'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ActivoBadge } from '@/components/shared/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import type { Usuario } from '@/lib/usuarios/usuarios-store';
import { useUsuariosStore } from '@/lib/usuarios/usuarios-store';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UsuariosTable({ data }: { data: Usuario[] }) {
  const { getRolNombre } = useUsuariosStore();
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: data,
  });

  return (
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
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>OTs activas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No se encontraron usuarios
              </TableCell>
            </TableRow>
          ) : (
            paginatedItems.map((usuario) => (
              <TableRow key={usuario.id} className="transition-colors hover:bg-muted/40">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {getInitials(usuario.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{usuario.nombre}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getRolNombre(usuario.rolId)}
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.telefono}</TableCell>
                <TableCell>
                  <ActivoBadge activo={usuario.activo} />
                </TableCell>
                <TableCell className="font-mono">{usuario.ordenesActivas}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
