import { AppShell } from '@/components/layout/app-shell';
import { CitasProvider } from '@/lib/citas/citas-store';
import { ClientesProvider } from '@/lib/clientes/clientes-store';
import { ConfiguracionProvider } from '@/lib/configuracion/configuracion-store';
import { InventarioProvider } from '@/lib/inventario/inventario-store';
import { OrdenesComercialesProvider } from '@/lib/ordenes/ordenes-comerciales-store';
import { ServiciosProvider } from '@/lib/servicios/servicios-store';
import { TallerProvider } from '@/lib/taller/taller-store';
import { UsuariosProvider } from '@/lib/usuarios/usuarios-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfiguracionProvider>
      <InventarioProvider>
        <ServiciosProvider>
          <UsuariosProvider>
            <ClientesProvider>
              <CitasProvider>
                <TallerProvider>
                  <OrdenesComercialesProvider>
                    <AppShell>{children}</AppShell>
                  </OrdenesComercialesProvider>
                </TallerProvider>
              </CitasProvider>
            </ClientesProvider>
          </UsuariosProvider>
        </ServiciosProvider>
      </InventarioProvider>
    </ConfiguracionProvider>
  );
}
