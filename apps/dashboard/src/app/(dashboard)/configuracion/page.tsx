import { PageHeader } from '@/components/layout/page-header';
import { SettingsForm } from '@/components/configuracion/settings-form';

export const metadata = {
  title: 'Configuración',
};

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configuración"
        description="Ajustes del taller y preferencias del sistema"
      />
      <SettingsForm />
    </div>
  );
}
