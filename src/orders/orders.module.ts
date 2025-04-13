import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NatsClientModule } from './transports/nats-client.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NatsClientModule],
})
export class OrdersModule {}
