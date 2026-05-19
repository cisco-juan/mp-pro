'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  OrdenComercialEstadoBadge,
  OrdenComercialTipoBadge,
} from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import {
  getOrdenComercialEstadoLabel,
  ordenComercialTipoLabels,
  type OrdenComercial,
} from '@/lib/mock-data';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import { formatDisplayDate } from '@org/utils-shared';

interface OrdenesTableProps {
  tipo: 'cotizacion' | 'factura';
}

export function OrdenesTable({ tipo }: OrdenesTableProps) {
  const { getClienteNombre } = useClientesStore();
  const { ordenesComerciales, convertCotizacionToFactura } = useOrdenesComercialesStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ordenesComerciales.filter((o) => {
      if (o.tipo !== tipo) return false;
      return (
        !q ||
        o.numero.toLowerCase().includes(q) ||
        getClienteNombre(o.clienteId).toLowerCase().includes(q)
      );
    });
  }, [search, tipo, ordenesComerciales]);

  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey: search,
  });

  async function handleConvertir(orden: OrdenComercial) {
    const factura = await convertCotizacionToFactura(orden.id);
    if (!factura) {
      toast.error('No se pudo convertir la cotización');
      return;
    }
    toast.success('Factura creada en borrador', {
      description: `${orden.numero} → ${factura.numero}`,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, cliente..."
          className="h-10 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={`Buscar ${tipo === 'cotizacion' ? 'cotizaciones' : 'facturas'}`}
        />
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
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              {tipo === 'cotizacion' && <TableHead>Validez</TableHead>}
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tipo === 'cotizacion' ? 7 : 6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron {tipo === 'cotizacion' ? 'cotizaciones' : 'facturas'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((orden) => (
                <TableRow key={orden.id} className="transition-colors hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{orden.numero}</span>
                      <OrdenComercialTipoBadge
                        tipo={orden.tipo}
                        label={ordenComercialTipoLabels[orden.tipo]}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{getClienteNombre(orden.clienteId)}</TableCell>
                  <TableCell>
                    <OrdenComercialEstadoBadge
                      tipo={orden.tipo}
                      estado={orden.estado}
                      label={getOrdenComercialEstadoLabel(orden)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDisplayDate(orden.fecha)}
                  </TableCell>
                  {tipo === 'cotizacion' && (
                    <TableCell className="text-muted-foreground">
                      {orden.validezHasta ? formatDisplayDate(orden.validezHasta) : '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-mono">
                    {orden.total.toLocaleString('es-ES')} €
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/ordenes/${orden.id}`}>Ver</Link>
                      </Button>
                      {tipo === 'cotizacion' && orden.estado === 'aceptada' && (
                        <Button variant="outline" size="sm" onClick={() => handleConvertir(orden)}>
                          Convertir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </div>
  );
}
