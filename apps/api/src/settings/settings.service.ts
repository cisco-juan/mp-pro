import { Injectable, NotFoundException } from '@nestjs/common';
import { mapWorkshopSettingsToResponse } from '../common/mappers/workshop-settings.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWorkshopSettingsDto } from './dto/update-workshop-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.client.workshopSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      throw new NotFoundException('Configuración del taller no encontrada');
    }
    return mapWorkshopSettingsToResponse(settings);
  }

  async update(dto: UpdateWorkshopSettingsDto) {
    await this.get();
    const settings = await this.prisma.client.workshopSettings.update({
      where: { id: 'default' },
      data: {
        ...(dto.nombreTaller !== undefined ? { nombreTaller: dto.nombreTaller.trim() } : {}),
        ...(dto.cif !== undefined ? { cif: dto.cif.trim() } : {}),
        ...(dto.direccion !== undefined ? { direccion: dto.direccion.trim() } : {}),
        ...(dto.horaApertura !== undefined ? { horaApertura: dto.horaApertura } : {}),
        ...(dto.horaCierre !== undefined ? { horaCierre: dto.horaCierre } : {}),
        ...(dto.bahias !== undefined ? { bahias: dto.bahias } : {}),
        ...(dto.notifCitas !== undefined ? { notifCitas: dto.notifCitas } : {}),
        ...(dto.notifOrdenes !== undefined ? { notifOrdenes: dto.notifOrdenes } : {}),
        ...(dto.notifRecordatorios !== undefined
          ? { notifRecordatorios: dto.notifRecordatorios }
          : {}),
        ...(dto.serieCotizacion !== undefined ? { serieCotizacion: dto.serieCotizacion } : {}),
        ...(dto.serieFactura !== undefined ? { serieFactura: dto.serieFactura } : {}),
        ...(dto.ivaPorcentaje !== undefined ? { ivaPorcentaje: dto.ivaPorcentaje } : {}),
      },
    });
    return mapWorkshopSettingsToResponse(settings);
  }
}
