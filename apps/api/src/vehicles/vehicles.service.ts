import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Vehicle } from '@org/database';
import { mapVehicleToResponse } from '../common/mappers/client.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId?: string) {
    const vehicles = await this.prisma.client.vehicle.findMany({
      where: clientId ? { clientId } : undefined,
      orderBy: [{ marca: 'asc' }, { modelo: 'asc' }],
    });
    return vehicles.map(mapVehicleToResponse);
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.client.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehículo #${id} no encontrado`);
    }
    return mapVehicleToResponse(vehicle);
  }

  async create(dto: CreateVehicleDto) {
    const matricula = dto.matricula.trim().toUpperCase();
    await this.ensureMatriculaAvailable(matricula);
    await this.ensureClientExists(dto.clientId);

    const createData = {
      clientId: dto.clientId,
      matricula,
      vin: dto.vin?.trim() || null,
      marca: dto.marca.trim(),
      modelo: dto.modelo.trim(),
      anio: dto.anio,
      color: dto.color?.trim() || '—',
      kilometraje: dto.kilometraje ?? 0,
      proximoMantenimiento: new Date(`${dto.proximoMantenimiento}T00:00:00`),
    };
    const vehicleCreate = this.prisma.client.vehicle.create as (args: unknown) => Promise<Vehicle>;
    const vehicle = await vehicleCreate({ data: createData });

    await this.touchClientUltimaVisita(dto.clientId);
    return mapVehicleToResponse(vehicle);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const current = await this.prisma.client.vehicle.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Vehículo #${id} no encontrado`);
    }

    if (dto.matricula) {
      const matricula = dto.matricula.trim().toUpperCase();
      const existing = await this.prisma.client.vehicle.findFirst({
        where: { matricula, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('La matrícula ya está registrada');
      }
    }

    if (dto.clientId && dto.clientId !== current.clientId) {
      await this.ensureClientExists(dto.clientId);
    }

    const data: Record<string, unknown> = {};
    if (dto.clientId !== undefined) data.clientId = dto.clientId;
    if (dto.matricula !== undefined) data.matricula = dto.matricula.trim().toUpperCase();
    if (dto.vin !== undefined) data.vin = dto.vin.trim() || null;
    if (dto.marca !== undefined) data.marca = dto.marca.trim();
    if (dto.modelo !== undefined) data.modelo = dto.modelo.trim();
    if (dto.anio !== undefined) data.anio = dto.anio;
    if (dto.color !== undefined) data.color = dto.color.trim() || '—';
    if (dto.kilometraje !== undefined) data.kilometraje = dto.kilometraje;
    if (dto.proximoMantenimiento !== undefined) {
      data.proximoMantenimiento = new Date(`${dto.proximoMantenimiento}T00:00:00`);
    }

    const vehicle = await this.prisma.client.vehicle.update({
      where: { id },
      data,
    });

    await this.touchClientUltimaVisita(vehicle.clientId);
    if (dto.clientId && dto.clientId !== current.clientId) {
      await this.touchClientUltimaVisita(current.clientId);
    }

    return mapVehicleToResponse(vehicle);
  }

  async toggleActive(id: string) {
    const current = await this.prisma.client.vehicle.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Vehículo #${id} no encontrado`);
    }

    const vehicle = await this.prisma.client.vehicle.update({
      where: { id },
      data: { estado: current.estado === 'activo' ? 'inactivo' : 'activo' },
    });

    return mapVehicleToResponse(vehicle);
  }

  private async ensureClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.client.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException(`Cliente #${clientId} no encontrado`);
    }
  }

  private async ensureMatriculaAvailable(matricula: string): Promise<void> {
    const existing = await this.prisma.client.vehicle.findUnique({
      where: { matricula },
    });
    if (existing) {
      throw new ConflictException('La matrícula ya está registrada');
    }
  }

  private async touchClientUltimaVisita(clientId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.client.client.update({
      where: { id: clientId },
      data: { ultimaVisita: today },
    });
  }
}
