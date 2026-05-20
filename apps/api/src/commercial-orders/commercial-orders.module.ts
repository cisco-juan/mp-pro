import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { CommercialOrdersController } from './commercial-orders.controller';
import { CommercialOrdersService } from './commercial-orders.service';

@Module({
  imports: [PaymentsModule],
  controllers: [CommercialOrdersController],
  providers: [CommercialOrdersService],
  exports: [CommercialOrdersService],
})
export class CommercialOrdersModule {}
