import { apiRequest } from './client';
import type { ConfiguracionTaller } from '@/lib/mock-data';

export async function fetchConfiguracionTaller(): Promise<ConfiguracionTaller> {
  return apiRequest<ConfiguracionTaller>('/settings/workshop');
}

export async function updateConfiguracionTallerApi(
  data: Partial<ConfiguracionTaller>,
): Promise<ConfiguracionTaller> {
  return apiRequest<ConfiguracionTaller>('/settings/workshop', {
    method: 'PATCH',
    body: data,
  });
}
