import { AppShell } from '@/components/layout/app-shell';
import { ClientesProvider } from '@/lib/clientes/clientes-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientesProvider>
      <AppShell>{children}</AppShell>
    </ClientesProvider>
  );
}
