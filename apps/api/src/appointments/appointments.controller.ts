import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentEstadoDto } from './dto/update-appointment-estado.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Permissions('citas:read', 'citas:write')
  findAll(
    @Query('clientId') clientId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.appointmentsService.findAll({ clientId, vehicleId, fecha });
  }

  @Get(':id')
  @Permissions('citas:read', 'citas:write')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @Permissions('citas:write')
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Patch(':id')
  @Permissions('citas:write')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Patch(':id/estado')
  @Permissions('citas:write')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateAppointmentEstadoDto) {
    return this.appointmentsService.updateEstado(id, dto);
  }
}
