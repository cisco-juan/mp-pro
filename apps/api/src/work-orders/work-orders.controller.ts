import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AddWorkOrderPartDto } from './dto/add-work-order-part.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { LinkCommercialOrderDto } from './dto/link-commercial-order.dto';
import { SetWorkOrderPartsDto } from './dto/set-work-order-parts.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderEstadoDto } from './dto/update-work-order-estado.dto';
import { WorkOrdersService } from './work-orders.service';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @Permissions('taller:write')
  findAll(
    @Query('clientId') clientId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('estado') estado?: 'pendiente' | 'en_progreso' | 'esperando_piezas' | 'completado',
  ) {
    return this.workOrdersService.findAll({ clientId, vehicleId, estado });
  }

  @Get(':id')
  @Permissions('taller:write')
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Post()
  @Permissions('taller:write')
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Patch(':id')
  @Permissions('taller:write')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrdersService.update(id, dto);
  }

  @Patch(':id/estado')
  @Permissions('taller:write')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateWorkOrderEstadoDto) {
    return this.workOrdersService.updateEstado(id, dto);
  }

  @Patch(':id/assign')
  @Permissions('taller:write')
  assignMechanic(@Param('id') id: string, @Body() dto: AssignWorkOrderDto) {
    return this.workOrdersService.assignMechanic(id, dto);
  }

  @Patch(':id/link-commercial-order')
  @Permissions('taller:write')
  linkCommercialOrder(@Param('id') id: string, @Body() dto: LinkCommercialOrderDto) {
    return this.workOrdersService.linkCommercialOrder(id, dto);
  }

  @Patch(':id/checklist/:index/toggle')
  @Permissions('taller:write')
  toggleChecklist(
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.workOrdersService.toggleChecklistItem(id, index);
  }

  @Post(':id/parts')
  @Permissions('taller:write')
  addPart(@Param('id') id: string, @Body() dto: AddWorkOrderPartDto) {
    return this.workOrdersService.addPart(id, dto);
  }

  @Put(':id/parts')
  @Permissions('taller:write')
  setParts(@Param('id') id: string, @Body() dto: SetWorkOrderPartsDto) {
    return this.workOrdersService.setParts(id, dto);
  }

  @Delete(':id/parts/:partLineId')
  @Permissions('taller:write')
  removePart(@Param('id') id: string, @Param('partLineId') partLineId: string) {
    return this.workOrdersService.removePart(id, partLineId);
  }
}
