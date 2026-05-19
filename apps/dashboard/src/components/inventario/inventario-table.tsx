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
import { piezas, piezaCategorias } from '@/lib/mock-data';

export function InventarioTable() {
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [open, setOpen] = useState(false);

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
  }, [search, filtroCategoria]);

  const resetKey = `${search}-${filtroCategoria}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  function handleCreate() {
    toast.success('Pieza registrada (maquetación)');
    setOpen(false);
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
              {piezaCategorias.map((cat) => (
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
                  <Input id="codigo" placeholder="FLT-OIL-001" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" placeholder="Nombre de la pieza" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" type="number" defaultValue="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="precio">Precio (€)</Label>
                    <Input id="precio" type="number" step="0.01" />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
