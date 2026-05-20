import { Pencil } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ActivoBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Usuario } from '@/lib/usuarios/usuarios-store';
import { useUsuariosStore } from '@/lib/usuarios/usuarios-store';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface UsuariosGridProps {
  data: Usuario[];
  onEdit?: (usuario: Usuario) => void;
}

export function UsuariosGrid({ data, onEdit }: UsuariosGridProps) {
  const { getRolNombre } = useUsuariosStore();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((usuario) => (
        <Card
          key={usuario.id}
          className="transition-all duration-200 hover:border-primary/20 hover:shadow-md"
        >
          <CardContent className="flex items-start gap-4 pt-6">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(usuario.nombre)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{usuario.nombre}</p>
                  <p className="text-sm text-muted-foreground">{getRolNombre(usuario.rolId)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => onEdit(usuario)}
                      aria-label="Editar usuario"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                  <ActivoBadge activo={usuario.activo} />
                </div>
              </div>
              <p className="mt-2 truncate text-sm">{usuario.email}</p>
              <p className="text-sm text-muted-foreground">{usuario.telefono}</p>
              {usuario.ordenesActivas > 0 && (
                <p className="mt-2 font-mono text-xs text-primary">
                  {usuario.ordenesActivas} OT{usuario.ordenesActivas > 1 ? 's' : ''} activa
                  {usuario.ordenesActivas > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
