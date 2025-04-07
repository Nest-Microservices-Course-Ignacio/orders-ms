import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/transports/nats-client.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NatsClientModule],
})
export class OrdersModule {}
