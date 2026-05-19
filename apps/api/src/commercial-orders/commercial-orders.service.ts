import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@org/database';
import { mapCommercialOrderToResponse } from '../common/mappers/commercial-order.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommercialOrderDto } from './dto/create-commercial-order.dto';
import { CreateFromWorkOrderDto } from './dto/create-from-work-order.dto';
import { CommercialOrderLineDto } from './dto/commercial-order-line.dto';
import { UpdateCommercialOrderEstadoDto } from './dto/update-commercial-order-estado.dto';

const orderInclude = {
  lineas: true,
  workOrders: { select: { id: true } },
} satisfies Prisma.CommercialOrderInclude;

@Injectable()
export class CommercialOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    clientId?: string;
    tipo?: 'cotizacion' | 'factura';
    estado?: string;
  }) {
    const orders = await this.prisma.client.commercialOrder.findMany({
      where: {
        ...(filters?.clientId ? { clientId: filters.clientId } : {}),
        ...(filters?.tipo ? { tipo: filters.tipo } : {}),
        ...(filters?.estado
          ? { estado: filters.estado as Prisma.EnumCommercialOrderEstadoFilter['equals'] }
          : {}),
      },
      include: orderInclude,
      orderBy: [{ fecha: 'desc' }, { numero: 'desc' }],
    });
    return orders.map(mapCommercialOrderToResponse);
  }

  async findOne(id: string) {
    const order = await this.getOrderOrThrow(id);
    return mapCommercialOrderToResponse(order);
  }

  async create(dto: CreateCommercialOrderDto) {
    await this.validateClientAndVehicle(dto.clienteId, dto.vehiculoId);
    if (dto.ordenTrabajoId) {
      await this.validateWorkOrderLink(dto.ordenTrabajoId, dto.clienteId, dto.vehiculoId);
    }

    const settings = await this.getSettings();
    const { subtotal, iva, total } = this.computeTotals(dto.lineas, Number(settings.ivaPorcentaje));
    const numero = await this.generateNumero(dto.tipo);
    const initialEstado = dto.tipo === 'cotizacion' ? 'borrador' : 'borrador';

    const order = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.commercialOrder.create({
        data: {
          numero,
          tipo: dto.tipo,
          estado: initialEstado,
          clientId: dto.clienteId,
          vehicleId: dto.vehiculoId ?? null,
          fecha: this.parseDate(dto.fecha),
          validezHasta: dto.validezHasta ? this.parseDate(dto.validezHasta) : null,
          subtotal,
          iva,
          total,
          lineas: { create: this.buildLineCreates(dto.lineas) },
        },
        include: orderInclude,
      });

      if (dto.ordenTrabajoId) {
        await tx.workOrder.update({
          where: { id: dto.ordenTrabajoId },
          data: { ordenComercialId: created.id },
        });
      }

      return tx.commercialOrder.findUniqueOrThrow({
        where: { id: created.id },
        include: orderInclude,
      });
    });

    return mapCommercialOrderToResponse(order);
  }

  async createCotizacionFromWorkOrder(dto: CreateFromWorkOrderDto) {
    const workOrder = await this.prisma.client.workOrder.findUnique({
      where: { id: dto.ordenTrabajoId },
      include: { partsUsed: true },
    });
    if (!workOrder) {
      throw new NotFoundException(`Orden de trabajo #${dto.ordenTrabajoId} no encontrada`);
    }

    if (workOrder.ordenComercialId) {
      const existing = await this.prisma.client.commercialOrder.findUnique({
        where: { id: workOrder.ordenComercialId },
        include: orderInclude,
      });
      if (existing && existing.tipo === 'cotizacion' && existing.estado !== 'convertida') {
        return mapCommercialOrderToResponse(existing);
      }
    }

    const lineas: CommercialOrderLineDto[] = [];
    if (workOrder.descripcion.trim()) {
      lineas.push({
        tipo: 'servicio',
        referenciaId: 'sv-custom',
        descripcion: workOrder.descripcion,
        cantidad: 1,
        precioUnitario: 0,
      });
    }

    for (const part of workOrder.partsUsed) {
      const inventory = await this.prisma.client.inventoryPart.findUnique({
        where: { id: part.inventoryPartId },
      });
      lineas.push({
        tipo: 'pieza',
        referenciaId: part.inventoryPartId,
        descripcion: inventory?.nombre ?? 'Pieza',
        cantidad: part.cantidad,
        precioUnitario: Number(part.precioUnitario),
      });
    }

    const validez = dto.validezHasta ?? this.addDaysIso(new Date(), 30);
    return this.create({
      tipo: 'cotizacion',
      clienteId: workOrder.clientId,
      vehiculoId: workOrder.vehicleId,
      ordenTrabajoId: workOrder.id,
      fecha: new Date().toISOString().slice(0, 10),
      validezHasta: validez,
      lineas,
    });
  }

  async updateEstado(id: string, dto: UpdateCommercialOrderEstadoDto) {
    const order = await this.getOrderOrThrow(id);
    this.assertEstadoTransition(order.tipo, order.estado, dto.estado);

    const updated = await this.prisma.client.commercialOrder.update({
      where: { id },
      data: { estado: dto.estado },
      include: orderInclude,
    });
    return mapCommercialOrderToResponse(updated);
  }

  async convertCotizacionToFactura(cotizacionId: string) {
    const cotizacion = await this.getOrderOrThrow(cotizacionId);
    if (cotizacion.tipo !== 'cotizacion') {
      throw new BadRequestException('Solo se pueden convertir cotizaciones');
    }
    if (cotizacion.estado !== 'aceptada' && cotizacion.estado !== 'enviada') {
      throw new BadRequestException('La cotización debe estar enviada o aceptada');
    }

    const workOrderId = cotizacion.workOrders[0]?.id;
    const factura = await this.create({
      tipo: 'factura',
      clienteId: cotizacion.clientId,
      vehiculoId: cotizacion.vehicleId ?? undefined,
      fecha: new Date().toISOString().slice(0, 10),
      lineas: cotizacion.lineas.map((line) => ({
        tipo: line.tipo,
        referenciaId: line.referenciaId,
        descripcion: line.descripcion,
        cantidad: line.cantidad,
        precioUnitario: Number(line.precioUnitario),
      })),
    });

    if (workOrderId) {
      await this.prisma.client.workOrder.update({
        where: { id: workOrderId },
        data: { ordenComercialId: factura.id },
      });
    }

    await this.prisma.client.commercialOrder.update({
      where: { id: cotizacionId },
      data: { estado: 'convertida' },
    });

    const refreshed = await this.getOrderOrThrow(factura.id);
    return mapCommercialOrderToResponse(refreshed);
  }

  private async getOrderOrThrow(id: string) {
    const order = await this.prisma.client.commercialOrder.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) {
      throw new NotFoundException(`Orden comercial #${id} no encontrada`);
    }
    return order;
  }

  private buildLineCreates(lineas: CommercialOrderLineDto[]) {
    return lineas.map((line, index) => {
      const subtotal = Math.round(line.cantidad * line.precioUnitario * 100) / 100;
      return {
        orden: index,
        tipo: line.tipo,
        referenciaId: line.referenciaId,
        descripcion: line.descripcion.trim(),
        cantidad: line.cantidad,
        precioUnitario: line.precioUnitario,
        subtotal,
      };
    });
  }

  private computeTotals(lineas: CommercialOrderLineDto[], ivaPorcentaje: number) {
    const subtotal =
      Math.round(
        lineas.reduce((sum, line) => sum + line.cantidad * line.precioUnitario, 0) * 100,
      ) / 100;
    const iva = Math.round(subtotal * (ivaPorcentaje / 100) * 100) / 100;
    const total = Math.round((subtotal + iva) * 100) / 100;
    return { subtotal, iva, total };
  }

  private async generateNumero(tipo: 'cotizacion' | 'factura') {
    const year = new Date().getFullYear();
    const prefix = tipo === 'cotizacion' ? `COT-${year}-` : `FAC-${year}-`;
    const last = await this.prisma.client.commercialOrder.findFirst({
      where: { numero: { startsWith: prefix } },
      orderBy: { numero: 'desc' },
    });
    let next = tipo === 'cotizacion' ? 100 : 50;
    if (last) {
      const match = last.numero.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) next = parseInt(match[1], 10) + 1;
    }
    const numero = `${prefix}${String(next).padStart(4, '0')}`;
    const exists = await this.prisma.client.commercialOrder.findUnique({ where: { numero } });
    if (exists) {
      throw new ConflictException('No se pudo generar un número único');
    }
    return numero;
  }

  private async validateClientAndVehicle(clientId: string, vehicleId?: string) {
    const client = await this.prisma.client.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException(`Cliente #${clientId} no encontrado`);

    if (vehicleId) {
      const vehicle = await this.prisma.client.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) throw new NotFoundException(`Vehículo #${vehicleId} no encontrado`);
      if (vehicle.clientId !== clientId) {
        throw new BadRequestException('El vehículo no pertenece al cliente');
      }
    }
  }

  private async validateWorkOrderLink(
    workOrderId: string,
    clientId: string,
    vehicleId?: string,
  ) {
    const workOrder = await this.prisma.client.workOrder.findUnique({ where: { id: workOrderId } });
    if (!workOrder) throw new NotFoundException(`Orden de trabajo #${workOrderId} no encontrada`);
    if (workOrder.clientId !== clientId) {
      throw new BadRequestException('La orden de trabajo no pertenece al cliente');
    }
    if (vehicleId && workOrder.vehicleId !== vehicleId) {
      throw new BadRequestException('La orden de trabajo no corresponde al vehículo');
    }
    if (workOrder.ordenComercialId) {
      const linked = await this.prisma.client.commercialOrder.findUnique({
        where: { id: workOrder.ordenComercialId },
      });
      if (linked && linked.estado !== 'convertida') {
        throw new ConflictException('La orden de trabajo ya tiene una orden comercial vinculada');
      }
    }
  }

  private assertEstadoTransition(
    tipo: 'cotizacion' | 'factura',
    current: string,
    next: string,
  ) {
    const cotizacionStates = ['borrador', 'enviada', 'aceptada', 'rechazada', 'convertida'];
    const facturaStates = ['borrador', 'emitida', 'pagada', 'vencida', 'anulada'];
    const allowed = tipo === 'cotizacion' ? cotizacionStates : facturaStates;
    if (!allowed.includes(next)) {
      throw new BadRequestException(`Estado ${next} no válido para ${tipo}`);
    }
    if (current === next) return;
    if (current === 'convertida' || current === 'anulada' || current === 'pagada') {
      throw new BadRequestException(`No se puede cambiar desde estado ${current}`);
    }
  }

  private async getSettings() {
    const settings = await this.prisma.client.workshopSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      throw new NotFoundException('Configuración del taller no encontrada');
    }
    return settings;
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private addDaysIso(date: Date, days: number): string {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
