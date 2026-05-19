'use client';

import { useMemo, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CitaEstadoBadge } from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import {
  citas,
  citaEstadoLabels,
  getClienteNombre,
  getServicioNombre,
  getVehiculoLabel,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';
import { cn } from '@/lib/utils';

const diasSemana = ['Lun 19', 'Mar 20', 'Mié 21', 'Jue 22', 'Vie 23', 'Sáb 24', 'Dom 25'];

const citasPorDiaSemana: Record<string, typeof citas> = {
  'Lun 19': citas.filter((c) => c.fecha === '2026-05-19'),
  'Mar 20': citas.filter((c) => c.fecha === '2026-05-20'),
  'Mié 21': citas.filter((c) => c.fecha === '2026-05-21'),
  'Jue 22': citas.filter((c) => c.fecha === '2026-05-22'),
  'Vie 23': citas.filter((c) => c.fecha === '2026-05-23'),
  'Sáb 24': [],
  'Dom 25': [],
};

export function CitasView() {
  const [vista, setVista] = useState<'semana' | 'lista'>('semana');

  const citasOrdenadas = useMemo(
    () =>
      [...citas].sort((a, b) =>
        `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)
      ),
    []
  );

  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: citasOrdenadas,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={vista === 'semana' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVista('semana')}
          className="min-h-10"
        >
          <LayoutGrid className="size-4" />
          Semana
        </Button>
        <Button
          variant={vista === 'lista' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVista('lista')}
          className="min-h-10"
        >
          <List className="size-4" />
          Lista
        </Button>
      </div>

      {vista === 'semana' ? (
        <div className="grid gap-3 overflow-x-auto md:grid-cols-7">
          {diasSemana.map((dia) => (
            <Card key={dia} className="min-w-[140px]">
              <CardHeader className="px-3 py-3">
                <CardTitle className="text-sm font-medium">{dia}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-3 pb-3">
                {(citasPorDiaSemana[dia] ?? []).length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">Sin citas</p>
                ) : (
                  (citasPorDiaSemana[dia] ?? []).map((cita) => (
                    <div
                      key={cita.id}
                      className={cn(
                        'rounded-md border border-border p-2 text-xs transition-colors hover:border-primary/40',
                        cita.estado === 'confirmada' && 'border-l-2 border-l-primary'
                      )}
                    >
                      <p className="font-mono font-semibold">{cita.hora}</p>
                      <p className="mt-1 font-medium leading-tight">
                        {getServicioNombre(cita.servicioId)}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {getClienteNombre(cita.clienteId)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((cita) => (
                <TableRow key={cita.id}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      )}
    </div>
  );
}
