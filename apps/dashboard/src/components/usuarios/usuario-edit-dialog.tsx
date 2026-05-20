'use client';

import { useState } from 'react';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsuariosStore, type Usuario } from '@/lib/usuarios/usuarios-store';

interface UsuarioEditDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UsuarioEditDialog({ usuario, open, onOpenChange }: UsuarioEditDialogProps) {
  const { roles, updateUsuario } = useUsuariosStore();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rolId, setRolId] = useState('');

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && usuario) {
      setNombre(usuario.nombre);
      setEmail(usuario.email);
      setTelefono(usuario.telefono ?? '');
      setRolId(usuario.rolId);
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    if (!usuario) return;
    const ok = await updateUsuario(usuario.id, { nombre, email, telefono, rolId });
    if (!ok) {
      toast.error('No se pudo actualizar el usuario');
      return;
    }
    toast.success('Usuario actualizado', { description: nombre });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Modificar los datos del usuario.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-usuario-nombre">Nombre</Label>
            <Input
              id="edit-usuario-nombre"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-usuario-email">Email</Label>
            <Input
              id="edit-usuario-email"
              type="email"
              placeholder="usuario@mppro.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-usuario-telefono">Teléfono</Label>
            <Input
              id="edit-usuario-telefono"
              placeholder="Teléfono de contacto"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-usuario-rol">Rol</Label>
            <Select value={rolId} onValueChange={setRolId}>
              <SelectTrigger id="edit-usuario-rol">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
