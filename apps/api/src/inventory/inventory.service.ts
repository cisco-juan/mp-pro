import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mapInventoryPartToResponse } from '../common/mappers/inventory.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateInventoryPartDto } from './dto/create-inventory-part.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { UpdateInventoryPartDto } from './dto/update-inventory-part.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoria?: string) {
    const parts = await this.prisma.client.inventoryPart.findMany({
      where: {
        estado: 'activo',
        ...(categoria ? { categoria } : {}),
      },
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });
    return parts.map(mapInventoryPartToResponse);
  }

  async findOne(id: string) {
    const part = await this.prisma.client.inventoryPart.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException(`Pieza #${id} no encontrada`);
    }
    return mapInventoryPartToResponse(part);
  }

  async create(dto: CreateInventoryPartDto) {
    const codigo = dto.codigo.trim().toUpperCase();
    await this.ensureCodigoAvailable(codigo);

    const part = await this.prisma.client.inventoryPart.create({
      data: {
        codigo,
        nombre: dto.nombre.trim(),
        categoria: dto.categoria.trim(),
        stock: dto.stock ?? 0,
        stockMinimo: dto.stockMinimo ?? 0,
        precioUnitario: dto.precioUnitario,
        ubicacion: dto.ubicacion?.trim() || null,
      },
    });

    return mapInventoryPartToResponse(part);
  }

  async update(id: string, dto: UpdateInventoryPartDto) {
    await this.findOne(id);

    if (dto.codigo) {
      const codigo = dto.codigo.trim().toUpperCase();
      const existing = await this.prisma.client.inventoryPart.findFirst({
        where: { codigo, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('El código ya está registrado');
      }
    }

    const part = await this.prisma.client.inventoryPart.update({
      where: { id },
      data: {
        ...(dto.codigo !== undefined ? { codigo: dto.codigo.trim().toUpperCase() } : {}),
        ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.categoria !== undefined ? { categoria: dto.categoria.trim() } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.stockMinimo !== undefined ? { stockMinimo: dto.stockMinimo } : {}),
        ...(dto.precioUnitario !== undefined ? { precioUnitario: dto.precioUnitario } : {}),
        ...(dto.ubicacion !== undefined ? { ubicacion: dto.ubicacion.trim() || null } : {}),
      },
    });

    return mapInventoryPartToResponse(part);
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    const current = await this.prisma.client.inventoryPart.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Pieza #${id} no encontrada`);
    }

    const nextStock = current.stock + dto.delta;
    if (nextStock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    const part = await this.prisma.client.inventoryPart.update({
      where: { id },
      data: { stock: nextStock },
    });

    return mapInventoryPartToResponse(part);
  }

  async reserveStock(id: string, dto: ReserveStockDto) {
    const current = await this.prisma.client.inventoryPart.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Pieza #${id} no encontrada`);
    }

    if (current.stock < dto.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    const part = await this.prisma.client.inventoryPart.update({
      where: { id },
      data: { stock: current.stock - dto.cantidad },
    });

    return mapInventoryPartToResponse(part);
  }

  async toggleActive(id: string) {
    const current = await this.prisma.client.inventoryPart.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Pieza #${id} no encontrada`);
    }

    const part = await this.prisma.client.inventoryPart.update({
      where: { id },
      data: { estado: current.estado === 'activo' ? 'inactivo' : 'activo' },
    });

    return mapInventoryPartToResponse(part);
  }

  private async ensureCodigoAvailable(codigo: string): Promise<void> {
    const existing = await this.prisma.client.inventoryPart.findUnique({ where: { codigo } });
    if (existing) {
      throw new ConflictException('El código ya está registrado');
    }
  }
}
