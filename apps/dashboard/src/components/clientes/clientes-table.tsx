'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClienteEstadoBadge } from '@/components/shared/status-badge';
import type { Cliente } from '@/lib/mock-data';
import { formatDisplayDate } from '@org/utils-shared';
import { toast } from 'sonner';

export function ClientesTable({ data }: { data: Cliente[] }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telefono.includes(q) ||
        c.empresa?.toLowerCase().includes(q)
    );
  }, [data, search]);

  function handleCreate() {
    toast.success('Cliente creado (maquetación)', {
      description: 'Esta acción es solo visual en la fase de prototipo.',
    });
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar clientes"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11">
              <Plus className="size-4" />
              Nuevo cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo cliente</DialogTitle>
              <DialogDescription>
                Formulario de ejemplo. Los datos no se guardan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input id="nombre" placeholder="Nombre y apellidos" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email-nuevo">Email</Label>
                <Input id="email-nuevo" type="email" placeholder="cliente@email.com" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" placeholder="+34 600 000 000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Vehículos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última visita</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cliente) => (
                <TableRow key={cliente.id} className="transition-colors hover:bg-muted/40">
                  <TableCell>
                    <div>
                      <p className="font-medium">{cliente.nombre}</p>
                      {cliente.empresa && (
                        <p className="text-xs text-muted-foreground">{cliente.empresa}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{cliente.email}</p>
                    <p className="text-xs text-muted-foreground">{cliente.telefono}</p>
                  </TableCell>
                  <TableCell className="font-mono">{cliente.vehiculosCount}</TableCell>
                  <TableCell>
                    <ClienteEstadoBadge activo={cliente.estado === 'activo'} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDisplayDate(cliente.ultimaVisita)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/clientes/${cliente.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
