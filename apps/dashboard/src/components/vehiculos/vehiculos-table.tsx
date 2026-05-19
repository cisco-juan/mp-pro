'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
import { UrgenciaBadge } from '@/components/shared/status-badge';
import {
  vehiculos,
  getClienteNombre,
  type Vehiculo,
  type MantenimientoUrgencia,
} from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';

export function VehiculosTable({ data = vehiculos }: { data?: Vehiculo[] }) {
  const [filtro, setFiltro] = useState<string>('todos');

  const filtered = useMemo(() => {
    if (filtro === 'todos') return data;
    return data.filter((v) => v.urgencia === filtro);
  }, [data, filtro]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado mantenimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ok">Al día</SelectItem>
            <SelectItem value="proximo">Próximo</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Kilometraje</TableHead>
              <TableHead>Próximo servicio</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id} className="transition-colors hover:bg-muted/40">
                <TableCell className="font-mono font-medium">{v.matricula}</TableCell>
                <TableCell>
                  {v.marca} {v.modelo}
                  <span className="ml-1 text-xs text-muted-foreground">({v.anio})</span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/clientes/${v.clienteId}`}
                    className="text-primary hover:underline"
                  >
                    {getClienteNombre(v.clienteId)}
                  </Link>
                </TableCell>
                <TableCell className="font-mono">
                  {v.kilometraje.toLocaleString('es-ES')} km
                </TableCell>
                <TableCell>{formatDisplayDate(v.proximoMantenimiento)}</TableCell>
                <TableCell>
                  <UrgenciaBadge urgencia={v.urgencia as MantenimientoUrgencia} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
