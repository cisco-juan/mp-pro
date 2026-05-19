import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { mapUserToResponse } from '../common/mappers/user.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.client.user.findMany({
      include: { role: true },
      orderBy: { nombre: 'asc' },
    });
    return users.map(mapUserToResponse);
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }
    return mapUserToResponse(user);
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.client.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    await this.ensureRoleExists(dto.rolId);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.client.user.create({
      data: {
        nombre: dto.nombre.trim(),
        email,
        telefono: dto.telefono?.trim() || null,
        roleId: dto.rolId,
        passwordHash,
        activo: dto.activo ?? true,
        ordenesActivas: dto.ordenesActivas ?? 0,
      },
      include: { role: true },
    });

    return mapUserToResponse(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.prisma.client.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    if (dto.rolId) {
      await this.ensureRoleExists(dto.rolId);
    }

    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.email !== undefined) data.email = dto.email.trim().toLowerCase();
    if (dto.telefono !== undefined) data.telefono = dto.telefono.trim() || null;
    if (dto.rolId !== undefined) data.roleId = dto.rolId;
    if (dto.activo !== undefined) data.activo = dto.activo;
    if (dto.ordenesActivas !== undefined) data.ordenesActivas = dto.ordenesActivas;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      data.passwordChangedAt = new Date();
    }

    const user = await this.prisma.client.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return mapUserToResponse(user);
  }

  async toggleActive(id: string) {
    const current = await this.prisma.client.user.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    const user = await this.prisma.client.user.update({
      where: { id },
      data: { activo: !current.activo },
      include: { role: true },
    });

    return mapUserToResponse(user);
  }

  private async ensureRoleExists(roleId: string): Promise<void> {
    const role = await this.prisma.client.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Rol #${roleId} no encontrado`);
    }
  }
}
