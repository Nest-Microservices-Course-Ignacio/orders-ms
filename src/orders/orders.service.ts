import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    Logger.log('Prisma Client is connected...', this.constructor.name);
    this.$connect();
  }

  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    console.log(id);
    return `This action returns a #${id} order`;
  }

  changeOrderStatus(id: number) {
    return `This action removes a #${id} order`;
  }
}
