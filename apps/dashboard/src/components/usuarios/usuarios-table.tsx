'use client';

import { Pencil } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

interface UsuariosTableProps {
  data: Usuario[];
  onEdit?: (usuario: Usuario) => void;
}

export function UsuariosTable({ data, onEdit }: UsuariosTableProps) {
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
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
                <TableCell className="text-right">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(usuario)}
                    >
                      <Pencil className="mr-1 size-3" />
                      Editar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
