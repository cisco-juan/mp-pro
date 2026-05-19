import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@org/database';
import { mapClientToResponse } from '../common/mappers/client.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

const clientInclude = { _count: { select: { vehicles: true } } } as const;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const clients = await this.prisma.client.client.findMany({
      include: clientInclude,
      orderBy: { nombre: 'asc' },
    });
    return clients.map(mapClientToResponse);
  }

  async findOne(id: string) {
    const client = await this.prisma.client.client.findUnique({
      where: { id },
      include: clientInclude,
    });
    if (!client) {
      throw new NotFoundException(`Cliente #${id} no encontrado`);
    }
    return mapClientToResponse(client);
  }

  async create(dto: CreateClientDto) {
    const email = dto.email.trim().toLowerCase();
    await this.ensureEmailAvailable(email);

    const clientData = this.buildClientData(dto, email);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dto.registrarVehiculo && dto.vehiculo) {
      const matricula = dto.vehiculo.matricula.trim().toUpperCase();
      await this.ensureMatriculaAvailable(matricula);

      const client = await this.prisma.client.$transaction(async (tx) => {
        const created = await tx.client.create({
          data: {
            ...clientData,
            ultimaVisita: today,
            vehicles: {
              create: this.buildVehicleCreateData(dto.vehiculo!, matricula),
            },
          },
          include: clientInclude,
        });
        return created;
      });
      return mapClientToResponse(client);
    }

    const client = await this.prisma.client.client.create({
      data: { ...clientData, ultimaVisita: today },
      include: clientInclude,
    });
    return mapClientToResponse(client);
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.prisma.client.client.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const client = await this.prisma.client.client.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(dto.telefono !== undefined ? { telefono: dto.telefono.trim() } : {}),
        ...(dto.telefonoSecundario !== undefined
          ? { telefonoSecundario: dto.telefonoSecundario.trim() || null }
          : {}),
        ...(dto.empresa !== undefined ? { empresa: dto.empresa.trim() || null } : {}),
        ...(dto.notas !== undefined ? { notas: dto.notas.trim() || null } : {}),
        ...(dto.documentoTipo !== undefined ? { documentoTipo: dto.documentoTipo } : {}),
        ...(dto.documentoNumero !== undefined
          ? { documentoNumero: dto.documentoNumero.trim() || null }
          : {}),
        ...(dto.direccionLinea1 !== undefined
          ? { direccionLinea1: dto.direccionLinea1.trim() || null }
          : {}),
        ...(dto.direccionLinea2 !== undefined
          ? { direccionLinea2: dto.direccionLinea2.trim() || null }
          : {}),
        ...(dto.direccionCiudad !== undefined
          ? { direccionCiudad: dto.direccionCiudad.trim() || null }
          : {}),
        ...(dto.direccionCodigoPostal !== undefined
          ? { direccionCodigoPostal: dto.direccionCodigoPostal.trim() || null }
          : {}),
        ...(dto.direccionProvincia !== undefined
          ? { direccionProvincia: dto.direccionProvincia.trim() || null }
          : {}),
        ultimaVisita: today,
      },
      include: clientInclude,
    });

    return mapClientToResponse(client);
  }

  async toggleActive(id: string) {
    const current = await this.prisma.client.client.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Cliente #${id} no encontrado`);
    }

    const client = await this.prisma.client.client.update({
      where: { id },
      data: { estado: current.estado === 'activo' ? 'inactivo' : 'activo' },
      include: clientInclude,
    });

    return mapClientToResponse(client);
  }

  private buildClientData(
    dto: CreateClientDto | UpdateClientDto,
    email?: string,
  ): Prisma.ClientCreateInput {
    const hasDireccion =
      dto.direccionLinea1?.trim() &&
      dto.direccionCiudad?.trim() &&
      dto.direccionCodigoPostal?.trim();

    return {
      nombre: dto.nombre!.trim(),
      email: email ?? dto.email!.trim().toLowerCase(),
      telefono: dto.telefono!.trim(),
      telefonoSecundario: dto.telefonoSecundario?.trim() || null,
      empresa: dto.empresa?.trim() || null,
      notas: dto.notas?.trim() || null,
      documentoTipo:
        dto.documentoTipo && dto.documentoNumero?.trim()
          ? dto.documentoTipo
          : null,
      documentoNumero:
        dto.documentoTipo && dto.documentoNumero?.trim()
          ? dto.documentoNumero.trim()
          : null,
      direccionLinea1: hasDireccion ? dto.direccionLinea1!.trim() : null,
      direccionLinea2: hasDireccion ? dto.direccionLinea2?.trim() || null : null,
      direccionCiudad: hasDireccion ? dto.direccionCiudad!.trim() : null,
      direccionCodigoPostal: hasDireccion ? dto.direccionCodigoPostal!.trim() : null,
      direccionProvincia: hasDireccion ? dto.direccionProvincia?.trim() || null : null,
    };
  }

  private buildVehicleCreateData(
    vehiculo: NonNullable<CreateClientDto['vehiculo']>,
    matricula: string,
  ): Prisma.VehicleCreateWithoutClientInput {
    const proximo = vehiculo.proximoMantenimiento
      ? new Date(`${vehiculo.proximoMantenimiento}T00:00:00`)
      : this.defaultProximoMantenimiento();

    return {
      matricula,
      marca: vehiculo.marca.trim(),
      modelo: vehiculo.modelo.trim(),
      anio: vehiculo.anio,
      color: vehiculo.color?.trim() || '—',
      kilometraje: vehiculo.kilometraje ?? 0,
      proximoMantenimiento: proximo,
    };
  }

  private defaultProximoMantenimiento(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.client.client.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
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
}
