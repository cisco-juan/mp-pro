'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { PagoMetodoBadge } from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import { getClienteNombre, pagoMetodoLabels, type PagoMetodo } from '@/lib/mock-data';
import {
  emptyPagoFormValues,
  useOrdenesComercialesStore,
} from '@/lib/ordenes/ordenes-comerciales-store';
import { formatDisplayDate } from '@org/utils-shared';

export function PagosTable() {
  const {
    pagos,
    getOrdenComercial,
    getFacturasPendientes,
    registerPago,
  } = useOrdenesComercialesStore();
  const pagosActivos = useMemo(() => pagos.filter((p) => p.monto > 0), [pagos]);
  const [search, setSearch] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('todos');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyPagoFormValues);

  const facturasPendientes = getFacturasPendientes();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pagosActivos.filter((p) => {
      const orden = getOrdenComercial(p.ordenComercialId);
      if (!orden) return false;

      const matchesSearch =
        !q ||
        p.referencia?.toLowerCase().includes(q) ||
        orden.numero.toLowerCase().includes(q) ||
        getClienteNombre(orden.clienteId).toLowerCase().includes(q);

      const matchesMetodo = filtroMetodo === 'todos' || p.metodo === filtroMetodo;

      return matchesSearch && matchesMetodo;
    });
  }, [pagosActivos, search, filtroMetodo, getOrdenComercial]);

  const resetKey = `${search}-${filtroMetodo}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  function handleCreate() {
    const pago = registerPago({
      ...form,
      ordenComercialId: form.ordenComercialId || facturasPendientes[0]?.id || '',
    });
    if (!pago) {
      toast.error('No se pudo registrar el pago', {
        description: 'Selecciona una factura emitida y un monto válido.',
      });
      return;
    }
    toast.success('Pago registrado', {
      description: `${pago.monto.toLocaleString('es-ES')} € registrados`,
    });
    setForm(emptyPagoFormValues);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por factura, cliente, referencia..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar pagos"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filtroMetodo} onValueChange={setFiltroMetodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los métodos</SelectItem>
              {(Object.keys(pagoMetodoLabels) as PagoMetodo[]).map((metodo) => (
                <SelectItem key={metodo} value={metodo}>
                  {pagoMetodoLabels[metodo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-11">
                <Plus className="size-4" />
                Registrar pago
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar pago</DialogTitle>
                <DialogDescription>
                  Asociar un pago a una factura pendiente de cobro.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="factura">Factura</Label>
                  <Select
                    value={form.ordenComercialId || facturasPendientes[0]?.id || ''}
                    onValueChange={(v) => setForm((f) => ({ ...f, ordenComercialId: v }))}
                  >
                    <SelectTrigger id="factura">
                      <SelectValue placeholder="Seleccionar factura" />
                    </SelectTrigger>
                    <SelectContent>
                      {facturasPendientes.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.numero} — {getClienteNombre(f.clienteId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="monto">Monto (€)</Label>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.monto}
                      onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="metodo">Método</Label>
                    <Select
                      value={form.metodo}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, metodo: v as PagoMetodo }))
                      }
                    >
                      <SelectTrigger id="metodo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(pagoMetodoLabels) as PagoMetodo[]).map((metodo) => (
                          <SelectItem key={metodo} value={metodo}>
                            {pagoMetodoLabels[metodo]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Registrar pago</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No se encontraron pagos
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((pago) => {
                const orden = getOrdenComercial(pago.ordenComercialId);
                return (
                  <TableRow key={pago.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="text-muted-foreground">
                      {formatDisplayDate(pago.fecha)}
                    </TableCell>
                    <TableCell>
                      {orden ? getClienteNombre(orden.clienteId) : '—'}
                    </TableCell>
                    <TableCell className="font-mono">{orden?.numero ?? '—'}</TableCell>
                    <TableCell>
                      <PagoMetodoBadge
                        metodo={pago.metodo}
                        label={pagoMetodoLabels[pago.metodo]}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {pago.referencia ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {pago.monto.toLocaleString('es-ES')} €
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
