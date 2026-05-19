'use client';

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
import type { Vehiculo } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

export function ClienteVehiculosTable({ data }: { data: Vehiculo[] }) {
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
            <TableHead>Matrícula</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Km</TableHead>
            <TableHead>Próximo mant.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Sin vehículos registrados
              </TableCell>
            </TableRow>
          ) : (
            paginatedItems.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono font-medium">{v.matricula}</TableCell>
                <TableCell>
                  {v.marca} {v.modelo} ({v.anio})
                </TableCell>
                <TableCell className="font-mono">
                  {v.kilometraje.toLocaleString('es-ES')}
                </TableCell>
                <TableCell>{formatDisplayDate(v.proximoMantenimiento)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
