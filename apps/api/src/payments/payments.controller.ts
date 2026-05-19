import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Permissions('pagos:read', 'pagos:write')
  findAll(
    @Query('ordenComercialId') ordenComercialId?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.paymentsService.findAll({ commercialOrderId: ordenComercialId, clientId });
  }

  @Get(':id')
  @Permissions('pagos:read', 'pagos:write')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @Permissions('pagos:write')
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }
}
