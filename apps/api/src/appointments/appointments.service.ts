import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mapAppointmentToResponse } from '../common/mappers/appointment.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentEstadoDto } from './dto/update-appointment-estado.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { clientId?: string; vehicleId?: string; fecha?: string }) {
    const appointments = await this.prisma.client.appointment.findMany({
      where: {
        ...(filters?.clientId ? { clientId: filters.clientId } : {}),
        ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
        ...(filters?.fecha ? { fecha: this.parseDate(filters.fecha) } : {}),
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    return appointments.map(mapAppointmentToResponse);
  }

  async findOne(id: string) {
    const appointment = await this.prisma.client.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException(`Cita #${id} no encontrada`);
    }
    return mapAppointmentToResponse(appointment);
  }

  async create(dto: CreateAppointmentDto) {
    await this.validateRelations(dto.clienteId, dto.vehiculoId, dto.servicioId);
    await this.ensureVehicleBelongsToClient(dto.vehiculoId, dto.clienteId);

    const appointment = await this.prisma.client.appointment.create({
      data: {
        clientId: dto.clienteId,
        vehicleId: dto.vehiculoId,
        serviceId: dto.servicioId,
        fecha: this.parseDate(dto.fecha),
        hora: dto.hora,
        duracionMin: dto.duracionMin,
        notas: dto.notas?.trim() || null,
      },
    });
    return mapAppointmentToResponse(appointment);
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const current = await this.prisma.client.appointment.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Cita #${id} no encontrada`);
    }

    const clientId = dto.clienteId ?? current.clientId;
    const vehicleId = dto.vehiculoId ?? current.vehicleId;
    const serviceId = dto.servicioId ?? current.serviceId;

    await this.validateRelations(clientId, vehicleId, serviceId);
    await this.ensureVehicleBelongsToClient(vehicleId, clientId);

    const appointment = await this.prisma.client.appointment.update({
      where: { id },
      data: {
        ...(dto.clienteId !== undefined ? { clientId: dto.clienteId } : {}),
        ...(dto.vehiculoId !== undefined ? { vehicleId: dto.vehiculoId } : {}),
        ...(dto.servicioId !== undefined ? { serviceId: dto.servicioId } : {}),
        ...(dto.fecha !== undefined ? { fecha: this.parseDate(dto.fecha) } : {}),
        ...(dto.hora !== undefined ? { hora: dto.hora } : {}),
        ...(dto.duracionMin !== undefined ? { duracionMin: dto.duracionMin } : {}),
        ...(dto.notas !== undefined ? { notas: dto.notas.trim() || null } : {}),
      },
    });
    return mapAppointmentToResponse(appointment);
  }

  async updateEstado(id: string, dto: UpdateAppointmentEstadoDto) {
    await this.findOne(id);
    const appointment = await this.prisma.client.appointment.update({
      where: { id },
      data: { estado: dto.estado },
    });
    return mapAppointmentToResponse(appointment);
  }

  private parseDate(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }
    return date;
  }

  private async validateRelations(clientId: string, vehicleId: string, serviceId: string) {
    const [client, vehicle, service] = await Promise.all([
      this.prisma.client.client.findUnique({ where: { id: clientId } }),
      this.prisma.client.vehicle.findUnique({ where: { id: vehicleId } }),
      this.prisma.client.serviceCatalog.findUnique({ where: { id: serviceId } }),
    ]);

    if (!client) throw new NotFoundException(`Cliente #${clientId} no encontrado`);
    if (!vehicle) throw new NotFoundException(`Vehículo #${vehicleId} no encontrado`);
    if (!service) throw new NotFoundException(`Servicio #${serviceId} no encontrado`);
    if (!service.activo) {
      throw new BadRequestException('El servicio seleccionado no está activo');
    }
  }

  private async ensureVehicleBelongsToClient(vehicleId: string, clientId: string) {
    const vehicle = await this.prisma.client.vehicle.findUnique({ where: { id: vehicleId } });
    if (vehicle?.clientId !== clientId) {
      throw new BadRequestException('El vehículo no pertenece al cliente indicado');
    }
  }
}
