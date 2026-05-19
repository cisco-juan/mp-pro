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
import { ActivoBadge } from '@/components/shared/status-badge';
import { DataTableShell } from '@/components/shared/data-table-shell';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import type { ServicioFormValues } from '@/lib/mock-data';
import { servicioCategorias as defaultCategorias } from '@/lib/mock-data';
import {
  emptyServicioFormValues,
  useServiciosStore,
} from '@/lib/servicios/servicios-store';

export function ServiciosTable() {
  const { servicios, categorias, createServicio, toggleServicioActivo } = useServiciosStore();
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ServicioFormValues>(emptyServicioFormValues);

  const allCategorias = useMemo(() => {
    const merged = new Set([...defaultCategorias, ...categorias]);
    return [...merged].sort();
  }, [categorias]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return servicios.filter((s) => {
      const matchesSearch =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q);

      const matchesCategoria = filtroCategoria === 'todos' || s.categoria === filtroCategoria;

      return matchesSearch && matchesCategoria;
    });
  }, [servicios, search, filtroCategoria]);

  const resetKey = `${search}-${filtroCategoria}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  async function handleCreate() {
    const servicio = await createServicio(form);
    if (!servicio) {
      toast.error('No se pudo registrar el servicio');
      return;
    }
    toast.success('Servicio registrado', { description: servicio.nombre });
    setForm(emptyServicioFormValues);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar servicios"
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
                Nuevo servicio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo servicio</DialogTitle>
                <DialogDescription>Registrar un servicio ofrecido por el taller.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre del servicio"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={form.descripcion}
                    onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      list="categorias-servicio"
                      value={form.categoria}
                      onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    />
                    <datalist id="categorias-servicio">
                      {allCategorias.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="duracion">Duración (min)</Label>
                    <Input
                      id="duracion"
                      type="number"
                      min={15}
                      value={form.duracionMin}
                      onChange={(e) => setForm((f) => ({ ...f, duracionMin: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="precio">Precio (€)</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.precio}
                    onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Registrar servicio</Button>
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
              <TableHead>Servicio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No se encontraron servicios
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((servicio) => (
                <TableRow key={servicio.id} className="transition-colors hover:bg-muted/40">
                  <TableCell>
                    <div>
                      <p className="font-medium">{servicio.nombre}</p>
                      <p className="text-xs text-muted-foreground">{servicio.descripcion}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{servicio.categoria}</TableCell>
                  <TableCell className="font-mono">{servicio.duracionMin} min</TableCell>
                  <TableCell>
                    <ActivoBadge activo={servicio.activo} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {servicio.precio.toLocaleString('es-ES')} €
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toggleServicioActivo(servicio.id);
                        toast.success(
                          servicio.activo ? 'Servicio desactivado' : 'Servicio activado'
                        );
                      }}
                    >
                      {servicio.activo ? 'Desactivar' : 'Activar'}
                    </Button>
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
