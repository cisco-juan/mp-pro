import { apiRequest } from './client';
import type { PagoFormValues, PagoMetodo } from '@/lib/mock-data';

export type Pago = {
  id: string;
  ordenComercialId: string;
  monto: number;
  fecha: string;
  metodo: PagoMetodo;
  referencia?: string;
  notas?: string;
};

export async function fetchPagos(params?: {
  ordenComercialId?: string;
  clientId?: string;
}): Promise<Pago[]> {
  const search = new URLSearchParams();
  if (params?.ordenComercialId) search.set('ordenComercialId', params.ordenComercialId);
  if (params?.clientId) search.set('clientId', params.clientId);
  const query = search.toString();
  return apiRequest<Pago[]>(`/payments${query ? `?${query}` : ''}`);
}

export async function registerPagoApi(values: PagoFormValues): Promise<Pago> {
  return apiRequest<Pago>('/payments', {
    method: 'POST',
    body: {
      ordenComercialId: values.ordenComercialId,
      monto: parseFloat(values.monto),
      metodo: values.metodo,
      referencia: values.referencia || undefined,
      notas: values.notas || undefined,
    },
  });
}
