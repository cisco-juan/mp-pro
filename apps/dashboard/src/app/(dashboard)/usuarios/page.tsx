import { PageHeader } from '@/components/layout/page-header';
import { UsuariosView } from '@/components/usuarios/usuarios-view';

export const metadata = {
  title: 'Usuarios',
};

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios y roles"
        description="Gestión de cuentas de acceso y permisos del taller"
      />
      <UsuariosView />
    </div>
  );
}
