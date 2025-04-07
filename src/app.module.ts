import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { NatsClientModule } from './nats-client/nats-client.module';

@Module({
  imports: [OrdersModule, NatsClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
