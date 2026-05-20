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

    const tipo = dto.delta > 0 ? 'entrada' : dto.delta < 0 ? 'salida' : 'ajuste';

    const part = await this.prisma.client.inventoryPart.update({
      where: { id },
      data: { stock: nextStock },
    });

    await this.logMovement({
      inventoryPartId: id,
      tipo,
      cantidad: dto.delta,
      stockAnterior: current.stock,
      stockNuevo: nextStock,
      nota: dto.nota ?? null,
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

    const nextStock = current.stock - dto.cantidad;

    const part = await this.prisma.client.inventoryPart.update({
      where: { id },
      data: { stock: nextStock },
    });

    await this.logMovement({
      inventoryPartId: id,
      tipo: 'reserva',
      cantidad: -dto.cantidad,
      stockAnterior: current.stock,
      stockNuevo: nextStock,
      nota: dto.nota ?? null,
    });

    return mapInventoryPartToResponse(part);
  }

  async findMovements(partId: string) {
    const part = await this.prisma.client.inventoryPart.findUnique({ where: { id: partId } });
    if (!part) {
      throw new NotFoundException(`Pieza #${partId} no encontrada`);
    }

    const model = this.getStockMovementModel();
    if (!model) {
      return [];
    }

    const movements = await model.findMany({
      where: { inventoryPartId: partId },
      orderBy: { createdAt: 'desc' },
    });

    return movements.map((m) => ({
      id: m['id'] as string,
      inventoryPartId: m['inventoryPartId'] as string,
      tipo: m['tipo'] as string,
      cantidad: m['cantidad'] as number,
      stockAnterior: m['stockAnterior'] as number,
      stockNuevo: m['stockNuevo'] as number,
      nota: (m['nota'] as string | null) ?? undefined,
      userId: (m['userId'] as string | null) ?? undefined,
      createdAt: (m['createdAt'] as Date).toISOString(),
    }));
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

  private async logMovement(data: {
    inventoryPartId: string;
    tipo: string;
    cantidad: number;
    stockAnterior: number;
    stockNuevo: number;
    nota: string | null;
  }): Promise<void> {
    const model = this.getStockMovementModel();
    if (model) {
      await model.create({ data });
    }
  }

  private getStockMovementModel() {
    const client = this.prisma.client as unknown as Record<string, unknown>;
    const model = client['stockMovement'];
    if (model && typeof model === 'object' && 'create' in (model as object)) {
      return model as {
        create: (args: { data: unknown }) => Promise<unknown>;
        findMany: (args: unknown) => Promise<Array<Record<string, unknown>>>;
      };
    }
    return null;
  }

  private async ensureCodigoAvailable(codigo: string): Promise<void> {
    const existing = await this.prisma.client.inventoryPart.findUnique({ where: { codigo } });
    if (existing) {
      throw new ConflictException('El código ya está registrado');
    }
  }
}
