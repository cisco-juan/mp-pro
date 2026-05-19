import type { ServiceCatalog } from '@org/database';

export type ServicioResponse = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  categoria: string;
  activo: boolean;
};

export function mapServiceCatalogToResponse(service: ServiceCatalog): ServicioResponse {
  return {
    id: service.id,
    nombre: service.nombre,
    descripcion: service.descripcion,
    precio: Number(service.precio),
    duracionMin: service.duracionMin,
    categoria: service.categoria,
    activo: service.activo,
  };
}
