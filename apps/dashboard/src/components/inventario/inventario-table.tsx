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
import { StockBadge } from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import {
  emptyPiezaFormValues,
  useInventarioStore,
} from '@/lib/inventario/inventario-store';
import type { PiezaFormValues } from '@/lib/mock-data';
import { piezaCategorias as defaultCategorias } from '@/lib/mock-data';

export function InventarioTable() {
  const { piezas, categorias, loading, createPieza, adjustStock } = useInventarioStore();
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PiezaFormValues>(emptyPiezaFormValues);
  const [stockTarget, setStockTarget] = useState<{ id: string; nombre: string } | null>(null);
  const [stockDelta, setStockDelta] = useState('1');

  const allCategorias = useMemo(() => {
    const merged = new Set([...defaultCategorias, ...categorias]);
    return [...merged].sort();
  }, [categorias]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return piezas.filter((p) => {
      const matchesSearch =
        !q ||
        p.codigo.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q);

      const matchesCategoria = filtroCategoria === 'todos' || p.categoria === filtroCategoria;

      return matchesSearch && matchesCategoria;
    });
  }, [piezas, search, filtroCategoria]);

  const resetKey = `${search}-${filtroCategoria}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  async function handleCreate() {
    const pieza = await createPieza(form);
    if (!pieza) {
      toast.error('No se pudo registrar la pieza', {
        description: 'Revisa los campos obligatorios y que el código no exista.',
      });
      return;
    }
    toast.success('Pieza registrada', { description: pieza.nombre });
    setForm(emptyPiezaFormValues);
    setOpen(false);
  }

  async function handleAdjustStock() {
    if (!stockTarget) return;
    const delta = parseInt(stockDelta, 10);
    if (!delta) {
      toast.error('Indica una cantidad válida');
      return;
    }
    const ok = await adjustStock(stockTarget.id, delta);
    if (!ok) {
      toast.error('No se pudo ajustar el stock');
      return;
    }
    toast.success('Stock actualizado');
    setStockTarget(null);
    setStockDelta('1');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar piezas"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las categorías</SelectItem>
              {allCategorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-11">
                <Plus className="size-4" />
                Nueva pieza
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva pieza</DialogTitle>
                <DialogDescription>Registrar una pieza en el inventario.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    placeholder="FLT-OIL-001"
                    value={form.codigo}
                    onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre de la pieza"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      placeholder="Filtros"
                      list="categorias-pieza"
                      value={form.categoria}
                      onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    />
                    <datalist id="categorias-pieza">
                      {allCategorias.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      placeholder="A-01"
                      value={form.ubicacion}
                      onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="stockMinimo">Mínimo</Label>
                    <Input
                      id="stockMinimo"
                      type="number"
                      min={0}
                      value={form.stockMinimo}
                      onChange={(e) => setForm((f) => ({ ...f, stockMinimo: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="precio">Precio (€)</Label>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.precioUnitario}
                      onChange={(e) => setForm((f) => ({ ...f, precioUnitario: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Registrar pieza</Button>
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
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Cargando inventario…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron piezas
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((pieza) => {
                const stockBajo = pieza.stock <= pieza.stockMinimo;
                return (
                  <TableRow key={pieza.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-mono font-medium">{pieza.codigo}</TableCell>
                    <TableCell>{pieza.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{pieza.categoria}</TableCell>
                    <TableCell className="font-mono">
                      {pieza.stock}
                      <span className="text-muted-foreground"> / min {pieza.stockMinimo}</span>
                    </TableCell>
                    <TableCell>
                      <StockBadge stockBajo={stockBajo} />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {pieza.ubicacion ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {pieza.precioUnitario.toLocaleString('es-ES')} €
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStockTarget({ id: pieza.id, nombre: pieza.nombre })}
                      >
                        Ajustar stock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableShell>

      <Dialog open={Boolean(stockTarget)} onOpenChange={(o) => !o && setStockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar stock</DialogTitle>
            <DialogDescription>
              {stockTarget?.nombre} — valor positivo para entrada, negativo para salida.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="delta">Cantidad (+ / −)</Label>
            <Input
              id="delta"
              type="number"
              value={stockDelta}
              onChange={(e) => setStockDelta(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAdjustStock}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
