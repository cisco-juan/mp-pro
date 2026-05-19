import { Injectable, NotFoundException } from '@nestjs/common';
import { mapRoleToResponse } from '../common/mappers/user.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.client.role.findMany({
      orderBy: { nombre: 'asc' },
    });
    return roles.map(mapRoleToResponse);
  }

  async findOne(id: string) {
    const role = await this.prisma.client.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Rol #${id} no encontrado`);
    }
    return mapRoleToResponse(role);
  }

  async create(dto: CreateRoleDto) {
    const role = await this.prisma.client.role.create({
      data: {
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion?.trim() ?? '',
        permisos: dto.permisos,
      },
    });
    return mapRoleToResponse(role);
  }
}
