'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="text-lg font-semibold">Algo salió mal</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Ha ocurrido un error al cargar esta sección. Inténtalo de nuevo.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
