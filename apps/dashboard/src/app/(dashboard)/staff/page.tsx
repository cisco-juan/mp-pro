import { PageHeader } from '@/components/layout/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { staff } from '@/lib/mock-data';

export const metadata = {
  title: 'Staff',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function StaffPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description="Equipo y roles del taller"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <Card
            key={member.id}
            className="transition-all duration-200 hover:border-primary/20 hover:shadow-md"
          >
            <CardContent className="flex items-start gap-4 pt-6">
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(member.nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{member.nombre}</p>
                    <p className="text-sm text-muted-foreground">{member.rol}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      member.activo
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }
                  >
                    {member.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="mt-2 truncate text-sm">{member.email}</p>
                <p className="text-sm text-muted-foreground">{member.telefono}</p>
                {member.ordenesActivas > 0 && (
                  <p className="mt-2 font-mono text-xs text-primary">
                    {member.ordenesActivas} OT{member.ordenesActivas > 1 ? 's' : ''} activa
                    {member.ordenesActivas > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
