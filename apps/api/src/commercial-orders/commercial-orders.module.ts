import { Module } from '@nestjs/common';
import { CommercialOrdersController } from './commercial-orders.controller';
import { CommercialOrdersService } from './commercial-orders.service';

@Module({
  controllers: [CommercialOrdersController],
  providers: [CommercialOrdersService],
  exports: [CommercialOrdersService],
})
export class CommercialOrdersModule {}
