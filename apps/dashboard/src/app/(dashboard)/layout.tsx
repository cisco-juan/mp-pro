import { AppShell } from '@/components/layout/app-shell';
import { CitasProvider } from '@/lib/citas/citas-store';
import { ClientesProvider } from '@/lib/clientes/clientes-store';
import { OrdenesComercialesProvider } from '@/lib/ordenes/ordenes-comerciales-store';
import { TallerProvider } from '@/lib/taller/taller-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientesProvider>
      <CitasProvider>
        <TallerProvider>
          <OrdenesComercialesProvider>
            <AppShell>{children}</AppShell>
          </OrdenesComercialesProvider>
        </TallerProvider>
      </CitasProvider>
    </ClientesProvider>
  );
}
