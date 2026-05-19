import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Permissions('clientes:read', 'clientes:write')
  findAll(@Query('clientId') clientId?: string) {
    return this.vehiclesService.findAll(clientId);
  }

  @Get(':id')
  @Permissions('clientes:read', 'clientes:write')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @Permissions('clientes:write')
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Patch(':id')
  @Permissions('clientes:write')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Permissions('clientes:write')
  toggleActive(@Param('id') id: string) {
    return this.vehiclesService.toggleActive(id);
  }
}
