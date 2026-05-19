import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Permissions('servicios:read', 'servicios:write', 'citas:write', 'citas:read')
  findAll(@Query('activos') activos?: string) {
    return this.servicesService.findAll(activos === 'true');
  }

  @Get(':id')
  @Permissions('servicios:read', 'servicios:write', 'citas:write', 'citas:read')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @Permissions('servicios:write')
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @Permissions('servicios:write')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Permissions('servicios:write')
  toggleActive(@Param('id') id: string) {
    return this.servicesService.toggleActive(id);
  }
}
