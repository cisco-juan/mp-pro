import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, WorkOrderEstado, WorkOrderTipo } from '@org/database';
import { mapWorkOrderToResponse } from '../common/mappers/work-order.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { WORK_ORDER_CHECKLIST_TEMPLATES } from './work-order.constants';
import { AddWorkOrderPartDto } from './dto/add-work-order-part.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { LinkCommercialOrderDto } from './dto/link-commercial-order.dto';
import { SetWorkOrderPartsDto } from './dto/set-work-order-parts.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderEstadoDto } from './dto/update-work-order-estado.dto';

const workOrderInclude = {
  partsUsed: true,
  checklist: { orderBy: { orden: 'asc' as const } },
  timeline: { orderBy: { fecha: 'asc' as const } },
} satisfies Prisma.WorkOrderInclude;

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    clientId?: string;
    vehicleId?: string;
    estado?: WorkOrderEstado;
  }) {
    const orders = await this.prisma.client.workOrder.findMany({
      where: {
        ...(filters?.clientId ? { clientId: filters.clientId } : {}),
        ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters?.estado ? { estado: filters.estado } : {}),
      },
      include: workOrderInclude,
      orderBy: [{ fechaEntrada: 'desc' }, { numero: 'desc' }],
    });
    return orders.map(mapWorkOrderToResponse);
  }

  async findOne(id: string) {
    const order = await this.getOrderOrThrow(id);
    return mapWorkOrderToResponse(order);
  }

  async create(dto: CreateWorkOrderDto) {
    await this.validateRelations(dto.clienteId, dto.vehiculoId, dto.usuarioId);
    await this.ensureVehicleBelongsToClient(dto.vehiculoId, dto.clienteId);

    const numero = await this.generateNumero();
    const checklist = this.buildChecklistItems(dto.tipo);

    const order = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.workOrder.create({
        data: {
          numero,
          tipo: dto.tipo,
          clientId: dto.clienteId,
          vehicleId: dto.vehiculoId,
          assignedUserId: dto.usuarioId,
          descripcion: dto.descripcion.trim(),
          fechaEntrada: this.parseDate(dto.fechaEntrada),
          fechaEstimada: this.parseDate(dto.fechaEstimada),
          checklist: { create: checklist },
          timeline: {
            create: {
              fecha: new Date(),
              estado: 'pendiente',
              nota: 'Orden creada',
            },
          },
        },
        include: workOrderInclude,
      });
      return created;
    });

    await this.syncUserOrdenesActivas(dto.usuarioId);
    return mapWorkOrderToResponse(order);
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    const current = await this.getOrderOrThrow(id);
    const clientId = dto.clienteId ?? current.clientId;
    const vehicleId = dto.vehiculoId ?? current.vehicleId;
    const userId = dto.usuarioId ?? current.assignedUserId;

    await this.validateRelations(clientId, vehicleId, userId);
    await this.ensureVehicleBelongsToClient(vehicleId, clientId);

    const tipoChanged = dto.tipo !== undefined && dto.tipo !== current.tipo;
    const previousUserId = current.assignedUserId;

    const order = await this.prisma.client.$transaction(async (tx) => {
      if (tipoChanged) {
        await tx.workOrderChecklistItem.deleteMany({ where: { workOrderId: id } });
        await tx.workOrderChecklistItem.createMany({
          data: this.buildChecklistItems(dto.tipo as WorkOrderTipo).map((item) => ({
            workOrderId: id,
            ...item,
          })),
        });
      }

      return tx.workOrder.update({
        where: { id },
        data: {
          ...(dto.clienteId !== undefined ? { clientId: dto.clienteId } : {}),
          ...(dto.vehiculoId !== undefined ? { vehicleId: dto.vehiculoId } : {}),
          ...(dto.usuarioId !== undefined ? { assignedUserId: dto.usuarioId } : {}),
          ...(dto.tipo !== undefined ? { tipo: dto.tipo } : {}),
          ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion.trim() } : {}),
          ...(dto.fechaEntrada !== undefined
            ? { fechaEntrada: this.parseDate(dto.fechaEntrada) }
            : {}),
          ...(dto.fechaEstimada !== undefined
            ? { fechaEstimada: this.parseDate(dto.fechaEstimada) }
            : {}),
        },
        include: workOrderInclude,
      });
    });

    if (dto.usuarioId && dto.usuarioId !== previousUserId) {
      await this.syncUserOrdenesActivas(previousUserId);
      await this.syncUserOrdenesActivas(dto.usuarioId);
    }

    return mapWorkOrderToResponse(order);
  }

  async updateEstado(id: string, dto: UpdateWorkOrderEstadoDto) {
    const current = await this.getOrderOrThrow(id);
    if (current.estado === dto.estado) {
      return mapWorkOrderToResponse(current);
    }

    const nota =
      dto.nota?.trim() ||
      `Estado actualizado a ${dto.estado.replace('_', ' ')}`;

    const order = await this.prisma.client.workOrder.update({
      where: { id },
      data: {
        estado: dto.estado,
        timeline: {
          create: {
            fecha: new Date(),
            estado: dto.estado,
            nota,
          },
        },
      },
      include: workOrderInclude,
    });

    await this.syncUserOrdenesActivas(current.assignedUserId);
    return mapWorkOrderToResponse(order);
  }

  async assignMechanic(id: string, dto: AssignWorkOrderDto) {
    const current = await this.getOrderOrThrow(id);
    const user = await this.prisma.client.user.findUnique({
      where: { id: dto.usuarioId },
    });
    if (!user || !user.activo) {
      throw new NotFoundException(`Usuario #${dto.usuarioId} no encontrado`);
    }

    const previousUserId = current.assignedUserId;
    const order = await this.prisma.client.workOrder.update({
      where: { id },
      data: { assignedUserId: dto.usuarioId },
      include: workOrderInclude,
    });

    if (previousUserId !== dto.usuarioId) {
      await this.syncUserOrdenesActivas(previousUserId);
      await this.syncUserOrdenesActivas(dto.usuarioId);
    }

    return mapWorkOrderToResponse(order);
  }

  async linkCommercialOrder(id: string, dto: LinkCommercialOrderDto) {
    await this.getOrderOrThrow(id);
    const order = await this.prisma.client.workOrder.update({
      where: { id },
      data: { ordenComercialId: dto.ordenComercialId.trim() },
      include: workOrderInclude,
    });
    return mapWorkOrderToResponse(order);
  }

  async toggleChecklistItem(id: string, index: number) {
    const order = await this.getOrderOrThrow(id);
    const items = [...order.checklist].sort((a, b) => a.orden - b.orden);
    const item = items[index];
    if (!item) {
      throw new BadRequestException('Índice de checklist inválido');
    }

    await this.prisma.client.workOrderChecklistItem.update({
      where: { id: item.id },
      data: { completado: !item.completado },
    });

    return this.findOne(id);
  }

  async addPart(id: string, dto: AddWorkOrderPartDto) {
    const order = await this.getOrderOrThrow(id);
    if (order.estado === 'completado') {
      throw new BadRequestException('No se pueden añadir piezas a una orden completada');
    }

    const part = await this.prisma.client.inventoryPart.findUnique({
      where: { id: dto.piezaId },
    });
    if (!part || part.estado !== 'activo') {
      throw new NotFoundException(`Pieza #${dto.piezaId} no encontrada`);
    }
    if (part.stock < dto.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.inventoryPart.update({
        where: { id: dto.piezaId },
        data: { stock: part.stock - dto.cantidad },
      });
      await tx.workOrderPart.create({
        data: {
          workOrderId: id,
          inventoryPartId: dto.piezaId,
          cantidad: dto.cantidad,
          precioUnitario: dto.precioUnitario,
        },
      });
      await this.recalculateTotal(tx, id);
    });

    return this.findOne(id);
  }

  async removePart(id: string, partLineId: string) {
    const order = await this.getOrderOrThrow(id);
    if (order.estado === 'completado') {
      throw new BadRequestException('No se pueden quitar piezas de una orden completada');
    }

    const line = order.partsUsed.find((p) => p.id === partLineId);
    if (!line) {
      throw new NotFoundException('Línea de pieza no encontrada');
    }

    await this.prisma.client.$transaction(async (tx) => {
      const inventoryPart = await tx.inventoryPart.findUnique({
        where: { id: line.inventoryPartId },
      });
      if (inventoryPart) {
        await tx.inventoryPart.update({
          where: { id: line.inventoryPartId },
          data: { stock: inventoryPart.stock + line.cantidad },
        });
      }
      await tx.workOrderPart.delete({ where: { id: partLineId } });
      await this.recalculateTotal(tx, id);
    });

    return this.findOne(id);
  }

  async setParts(id: string, dto: SetWorkOrderPartsDto) {
    const order = await this.getOrderOrThrow(id);
    if (order.estado === 'completado') {
      throw new BadRequestException('No se pueden modificar piezas de una orden completada');
    }

    for (const pieza of dto.piezas) {
      const part = await this.prisma.client.inventoryPart.findUnique({
        where: { id: pieza.piezaId },
      });
      if (!part || part.estado !== 'activo') {
        throw new NotFoundException(`Pieza #${pieza.piezaId} no encontrada`);
      }
    }

    await this.prisma.client.$transaction(async (tx) => {
      for (const line of order.partsUsed) {
        const inventoryPart = await tx.inventoryPart.findUnique({
          where: { id: line.inventoryPartId },
        });
        if (inventoryPart) {
          await tx.inventoryPart.update({
            where: { id: line.inventoryPartId },
            data: { stock: inventoryPart.stock + line.cantidad },
          });
        }
      }

      await tx.workOrderPart.deleteMany({ where: { workOrderId: id } });

      for (const pieza of dto.piezas) {
        const part = await tx.inventoryPart.findUnique({
          where: { id: pieza.piezaId },
        });
        if (!part || part.stock < pieza.cantidad) {
          throw new BadRequestException(`Stock insuficiente para pieza #${pieza.piezaId}`);
        }
        await tx.inventoryPart.update({
          where: { id: pieza.piezaId },
          data: { stock: part.stock - pieza.cantidad },
        });
        await tx.workOrderPart.create({
          data: {
            workOrderId: id,
            inventoryPartId: pieza.piezaId,
            cantidad: pieza.cantidad,
            precioUnitario: pieza.precioUnitario,
          },
        });
      }

      await this.recalculateTotal(tx, id);
    });

    return this.findOne(id);
  }

  private async getOrderOrThrow(id: string) {
    const order = await this.prisma.client.workOrder.findUnique({
      where: { id },
      include: workOrderInclude,
    });
    if (!order) {
      throw new NotFoundException(`Orden de trabajo #${id} no encontrada`);
    }
    return order;
  }

  private async validateRelations(
    clientId: string,
    vehicleId: string,
    userId: string,
  ): Promise<void> {
    const [client, vehicle, user] = await Promise.all([
      this.prisma.client.client.findUnique({ where: { id: clientId } }),
      this.prisma.client.vehicle.findUnique({ where: { id: vehicleId } }),
      this.prisma.client.user.findUnique({ where: { id: userId } }),
    ]);

    if (!client) {
      throw new NotFoundException(`Cliente #${clientId} no encontrado`);
    }
    if (!vehicle) {
      throw new NotFoundException(`Vehículo #${vehicleId} no encontrado`);
    }
    if (!user || !user.activo) {
      throw new NotFoundException(`Usuario #${userId} no encontrado`);
    }
  }

  private async ensureVehicleBelongsToClient(
    vehicleId: string,
    clientId: string,
  ): Promise<void> {
    const vehicle = await this.prisma.client.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle || vehicle.clientId !== clientId) {
      throw new BadRequestException('El vehículo no pertenece al cliente indicado');
    }
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00`);
  }

  private buildChecklistItems(tipo: WorkOrderTipo) {
    return WORK_ORDER_CHECKLIST_TEMPLATES[tipo].map((item, orden) => ({
      orden,
      item,
      completado: false,
    }));
  }

  private async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OT-${year}-`;
    const latest = await this.prisma.client.workOrder.findFirst({
      where: { numero: { startsWith: prefix } },
      orderBy: { numero: 'desc' },
    });

    let next = 1;
    if (latest) {
      const match = latest.numero.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        next = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(next).padStart(4, '0')}`;
  }

  private async recalculateTotal(
    tx: Prisma.TransactionClient,
    workOrderId: string,
  ): Promise<void> {
    const parts = await tx.workOrderPart.findMany({ where: { workOrderId } });
    const total = parts.reduce(
      (sum, part) => sum + part.cantidad * Number(part.precioUnitario),
      0,
    );
    await tx.workOrder.update({
      where: { id: workOrderId },
      data: { totalEstimado: total },
    });
  }

  private async syncUserOrdenesActivas(userId: string): Promise<void> {
    const count = await this.prisma.client.workOrder.count({
      where: {
        assignedUserId: userId,
        estado: { not: 'completado' },
      },
    });
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { ordenesActivas: count },
    });
  }
}
