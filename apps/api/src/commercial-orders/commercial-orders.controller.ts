import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CommercialOrdersService } from './commercial-orders.service';
import { CreateCommercialOrderDto } from './dto/create-commercial-order.dto';
import { CreateFromWorkOrderDto } from './dto/create-from-work-order.dto';
import { UpdateCommercialOrderEstadoDto } from './dto/update-commercial-order-estado.dto';

@Controller('commercial-orders')
export class CommercialOrdersController {
  constructor(private readonly commercialOrdersService: CommercialOrdersService) {}

  @Get()
  @Permissions('ordenes:read', 'ordenes:write', 'pagos:read', 'pagos:write')
  findAll(
    @Query('clientId') clientId?: string,
    @Query('tipo') tipo?: 'cotizacion' | 'factura',
    @Query('estado') estado?: string,
  ) {
    return this.commercialOrdersService.findAll({ clientId, tipo, estado });
  }

  @Get(':id')
  @Permissions('ordenes:read', 'ordenes:write', 'pagos:read', 'pagos:write')
  findOne(@Param('id') id: string) {
    return this.commercialOrdersService.findOne(id);
  }

  @Post()
  @Permissions('ordenes:write')
  create(@Body() dto: CreateCommercialOrderDto) {
    return this.commercialOrdersService.create(dto);
  }

  @Post('from-work-order')
  @Permissions('ordenes:write')
  createFromWorkOrder(@Body() dto: CreateFromWorkOrderDto) {
    return this.commercialOrdersService.createCotizacionFromWorkOrder(dto);
  }

  @Patch(':id/estado')
  @Permissions('ordenes:write')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateCommercialOrderEstadoDto) {
    return this.commercialOrdersService.updateEstado(id, dto);
  }

  @Post(':id/convert-to-invoice')
  @Permissions('ordenes:write')
  convertToInvoice(@Param('id') id: string) {
    return this.commercialOrdersService.convertCotizacionToFactura(id);
  }
}
