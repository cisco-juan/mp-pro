import { Injectable, NotFoundException } from '@nestjs/common';
import { mapServiceCatalogToResponse } from '../common/mappers/service-catalog.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activosOnly = false) {
    const services = await this.prisma.client.serviceCatalog.findMany({
      where: activosOnly ? { activo: true } : undefined,
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });
    return services.map(mapServiceCatalogToResponse);
  }

  async findOne(id: string) {
    const service = await this.prisma.client.serviceCatalog.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Servicio #${id} no encontrado`);
    }
    return mapServiceCatalogToResponse(service);
  }

  async create(dto: CreateServiceDto) {
    const service = await this.prisma.client.serviceCatalog.create({
      data: {
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion?.trim() ?? '',
        precio: dto.precio,
        duracionMin: dto.duracionMin,
        categoria: dto.categoria.trim(),
      },
    });
    return mapServiceCatalogToResponse(service);
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    const service = await this.prisma.client.serviceCatalog.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion.trim() } : {}),
        ...(dto.precio !== undefined ? { precio: dto.precio } : {}),
        ...(dto.duracionMin !== undefined ? { duracionMin: dto.duracionMin } : {}),
        ...(dto.categoria !== undefined ? { categoria: dto.categoria.trim() } : {}),
        ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
      },
    });
    return mapServiceCatalogToResponse(service);
  }

  async toggleActive(id: string) {
    const current = await this.findOne(id);
    const service = await this.prisma.client.serviceCatalog.update({
      where: { id },
      data: { activo: !current.activo },
    });
    return mapServiceCatalogToResponse(service);
  }
}
