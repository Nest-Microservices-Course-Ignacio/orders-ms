import { Module } from '@nestjs/common';

import { OrdersModule } from './orders/orders.module';
import { NatsClientModule } from './orders/transports/nats-client.module';

@Module({
  imports: [OrdersModule, NatsClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
