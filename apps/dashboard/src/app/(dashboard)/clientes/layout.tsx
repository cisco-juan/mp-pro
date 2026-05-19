import { ClientesProvider } from '@/lib/clientes/clientes-store';

export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  return <ClientesProvider>{children}</ClientesProvider>;
}
