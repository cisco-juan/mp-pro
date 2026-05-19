'use client';

import { useMemo, useState } from 'react';
import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TablePagination } from '@/components/shared/table-pagination';
import { usePagination } from '@/hooks/use-pagination';
import { roles, usuarios } from '@/lib/mock-data';
import { UsuariosGrid } from './usuarios-grid';
import { UsuariosTable } from './usuarios-table';
import { RolesTable } from './roles-table';

export function UsuariosView() {
  const [vista, setVista] = useState<'cards' | 'tabla'>('cards');
  const [search, setSearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [openUsuario, setOpenUsuario] = useState(false);
  const [openRol, setOpenRol] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return usuarios.filter((usuario) => {
      const matchesSearch =
        !q ||
        usuario.nombre.toLowerCase().includes(q) ||
        usuario.email.toLowerCase().includes(q) ||
        usuario.telefono.includes(q);

      const matchesActivo =
        filtroActivo === 'todos' ||
        (filtroActivo === 'activo' && usuario.activo) ||
        (filtroActivo === 'inactivo' && !usuario.activo);

      return matchesSearch && matchesActivo;
    });
  }, [search, filtroActivo]);

  const resetKey = `${search}-${filtroActivo}`;
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items: filtered,
    resetKey,
  });

  function handleCreateUsuario() {
    toast.success('Usuario creado (maquetación)');
    setOpenUsuario(false);
  }

  function handleCreateRol() {
    toast.success('Rol creado (maquetación)');
    setOpenRol(false);
  }

  return (
    <Tabs defaultValue="usuarios" className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
      </TabsList>

      <TabsContent value="usuarios" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant={vista === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVista('cards')}
              className="min-h-10"
            >
              <LayoutGrid className="size-4" />
              Tarjetas
            </Button>
            <Button
              variant={vista === 'tabla' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVista('tabla')}
              className="min-h-10"
            >
              <List className="size-4" />
              Tabla
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                className="h-10 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar usuarios"
              />
            </div>
            <Select value={filtroActivo} onValueChange={setFiltroActivo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={openUsuario} onOpenChange={setOpenUsuario}>
              <DialogTrigger asChild>
                <Button className="min-h-11">
                  <Plus className="size-4" />
                  Nuevo usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo usuario</DialogTitle>
                  <DialogDescription>
                    Crear una cuenta de acceso al sistema del taller.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" placeholder="Nombre completo" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="usuario@mppro.local" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select defaultValue={roles[0]?.id}>
                      <SelectTrigger id="rol">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((rol) => (
                          <SelectItem key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateUsuario}>Crear usuario</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {vista === 'cards' ? (
          filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No se encontraron usuarios</p>
          ) : (
            <>
              <UsuariosGrid data={paginatedItems} />
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <TablePagination
                  page={page}
                  totalPages={totalPages}
                  rangeLabel={rangeLabel}
                  onPageChange={setPage}
                />
              </div>
            </>
          )
        ) : (
          <UsuariosTable data={filtered} key={resetKey} />
        )}
      </TabsContent>

      <TabsContent value="roles" className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Dialog open={openRol} onOpenChange={setOpenRol}>
            <DialogTrigger asChild>
              <Button className="min-h-11">
                <Plus className="size-4" />
                Nuevo rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo rol</DialogTitle>
                <DialogDescription>
                  Definir un rol con permisos de acceso al sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rol-nombre">Nombre</Label>
                  <Input id="rol-nombre" placeholder="Ej. Supervisor" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="rol-desc">Descripción</Label>
                  <Input id="rol-desc" placeholder="Descripción del rol" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateRol}>Crear rol</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <RolesTable data={roles} />
      </TabsContent>
    </Tabs>
  );
}
