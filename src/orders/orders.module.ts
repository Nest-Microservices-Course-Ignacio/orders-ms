import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { NatsClientModule } from 'src/nats-client/nats-client.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NatsClientModule],
})
export class OrdersModule {}
