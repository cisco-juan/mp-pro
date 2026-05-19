'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { getUsuariosByRolId, type Rol } from '@/lib/mock-data';

export function RolesTable({ data }: { data: Rol[] }) {
  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rol</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Usuarios</TableHead>
            <TableHead>Permisos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((rol) => (
            <TableRow key={rol.id} className="transition-colors hover:bg-muted/40">
              <TableCell className="font-medium">{rol.nombre}</TableCell>
              <TableCell className="max-w-[240px] text-muted-foreground">
                {rol.descripcion}
              </TableCell>
              <TableCell className="font-mono">{getUsuariosByRolId(rol.id).length}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {rol.permisos.map((permiso) => (
                    <Badge key={permiso} variant="secondary" className="font-mono text-xs">
                      {permiso}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
