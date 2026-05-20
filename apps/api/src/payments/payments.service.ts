import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mapPaymentToResponse } from '../common/mappers/payment.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { commercialOrderId?: string; clientId?: string }) {
    const payments = await this.prisma.client.payment.findMany({
      where: {
        ...(filters?.commercialOrderId
          ? { commercialOrderId: filters.commercialOrderId }
          : {}),
        ...(filters?.clientId
          ? { commercialOrder: { clientId: filters.clientId } }
          : {}),
      },
      orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
    });
    return payments.map(mapPaymentToResponse);
  }

  async findOne(id: string) {
    const payment = await this.prisma.client.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Pago #${id} no encontrado`);
    }
    return mapPaymentToResponse(payment);
  }

  async create(dto: CreatePaymentDto) {
    const order = await this.prisma.client.commercialOrder.findUnique({
      where: { id: dto.ordenComercialId },
    });
    if (!order) {
      throw new NotFoundException(`Orden comercial #${dto.ordenComercialId} no encontrada`);
    }
    if (order.tipo !== 'factura') {
      throw new BadRequestException('Solo se registran pagos sobre facturas');
    }
    if (order.estado !== 'emitida' && order.estado !== 'pagada') {
      throw new BadRequestException('La factura debe estar emitida o pagada');
    }

    const fecha = dto.fecha
      ? new Date(`${dto.fecha}T00:00:00.000Z`)
      : new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');

    const result = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          commercialOrderId: dto.ordenComercialId,
          monto: dto.monto,
          fecha,
          metodo: dto.metodo,
          referencia: dto.referencia?.trim() || null,
          notas: dto.notas?.trim() || null,
        },
      });

      const pagos = await tx.payment.findMany({
        where: { commercialOrderId: dto.ordenComercialId, monto: { gt: 0 } },
      });
      const pagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
      if (pagado >= Number(order.total) - 0.01) {
        await tx.commercialOrder.update({
          where: { id: dto.ordenComercialId },
          data: { estado: 'pagada' },
        });
      }

      return { payment: created, pagado };
    });

    const total = Number(order.total);
    const pendiente = Math.max(0, Math.round((total - result.pagado) * 100) / 100);

    return {
      ...mapPaymentToResponse(result.payment),
      saldoPendiente: pendiente,
    };
  }

  async getBalance(commercialOrderId: string) {
    const order = await this.prisma.client.commercialOrder.findUnique({
      where: { id: commercialOrderId },
    });
    if (!order) {
      throw new NotFoundException(`Orden comercial #${commercialOrderId} no encontrada`);
    }

    const pagos = await this.prisma.client.payment.findMany({
      where: { commercialOrderId, monto: { gt: 0 } },
    });

    const total = Number(order.total);
    const pagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
    const pendiente = Math.max(0, Math.round((total - pagado) * 100) / 100);

    return { total, pagado, pendiente };
  }
}
