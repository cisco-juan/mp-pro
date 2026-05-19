import { AppShell } from '@/components/layout/app-shell';
import { CitasProvider } from '@/lib/citas/citas-store';
import { ClientesProvider } from '@/lib/clientes/clientes-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientesProvider>
      <CitasProvider>
        <AppShell>{children}</AppShell>
      </CitasProvider>
    </ClientesProvider>
  );
}
