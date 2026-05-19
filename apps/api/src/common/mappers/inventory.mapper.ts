import type { InventoryPart } from '@org/database';

export type PiezaResponse = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precioUnitario: number;
  ubicacion?: string;
  estado: 'activo' | 'inactivo';
};

export function mapInventoryPartToResponse(part: InventoryPart): PiezaResponse {
  return {
    id: part.id,
    codigo: part.codigo,
    nombre: part.nombre,
    categoria: part.categoria,
    stock: part.stock,
    stockMinimo: part.stockMinimo,
    precioUnitario: Number(part.precioUnitario),
    ubicacion: part.ubicacion ?? undefined,
    estado: part.estado,
  };
}
