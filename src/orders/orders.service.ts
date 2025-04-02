import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    Logger.log('Database connected...', this.constructor.name);
    this.$connect();
  }

  async create(createOrderDto: CreateOrderDto) {
    Logger.log('Creating order...', this.constructor.name);
    return await this.orders.create({
      data: createOrderDto,
    });
  }

  async findAll() {
    return await this.orders.findMany({});
  }

  async findOne(id: string) {
    Logger.log(`Finding order with id ${id}...`, this.constructor.name);
    const order = await this.orders.findUnique({
      where: { id },
    });

    if (!order) {
      Logger.error(`Order with id ${id} not found`, this.constructor.name);
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    return order;
  }

  changeOrderStatus(id: number) {
    return `This action removes a #${id} order`;
  }
}
