import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create_order' })
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = this.ordersService.createPaymentSession(order);
    return { paymentSession, order };
  }

  @MessagePattern({ cmd: 'find_all_orders' })
  findAll(@Payload() orderPagination: OrderPaginationDto) {
    return this.ordersService.findAll(orderPagination);
  }

  @MessagePattern({ cmd: 'find_by_status' })
  findAllByStatus(@Payload() orderPagination: OrderPaginationDto) {
    return this.ordersService.findAllByStatus(orderPagination);
  }

  @MessagePattern({ cmd: 'find_one_order' })
  findOne(@Payload() id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern({ cmd: 'change_order_status' })
  changeOrderStatus(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.changeOrderStatus(updateOrderDto);
  }
}
