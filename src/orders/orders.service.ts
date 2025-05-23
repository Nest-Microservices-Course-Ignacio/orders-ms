import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';

import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { OrdersCommands } from 'src/common/cmd/orders.cmd';
import { ProductsCommands } from 'src/common/cmd/products.cmd';
import { NATS_SERVICE } from 'src/config/services';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enum/orderStatus.enum';
import {
  OrderItems,
  OrderWithProducts,
} from './interfaces/orders-with-products.interface';
import { PaidOrderDto } from './dto/paid-order.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    Logger.log('Database connected...', this.constructor.name);
    await this.$connect();
  }

  async create(createOrderDto: CreateOrderDto) {
    Logger.log('Creating order...', this.constructor.name);

    // verify if the products exist
    try {
      const productsIds = createOrderDto.items.map((item) => item.productId);

      const productsExist = await this.getProductsByIds({
        productsIds,
      });

      const totalAmount = createOrderDto.items.reduce((sum, orderItem) => {
        const product = productsExist.find((p) => p.id === orderItem.productId);
        return sum + product.price * orderItem.quantity;
      }, 0);

      const totalItem = createOrderDto.items.length;

      const orderCreated = await this.orders.create({
        data: {
          totalAmount,
          totalItem,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                price: productsExist.find((p) => p.id === orderItem.productId)
                  .price,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              productId: true,
              price: true,
              quantity: true,
            },
          },
        },
      });

      return {
        ...orderCreated,
        status: orderCreated.status as unknown as OrderStatus,
        OrderItem: orderCreated.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: productsExist.find((p) => p.id === orderItem.productId).name,
        })),
      };
    } catch (error) {
      console.error(error);
      throw new RpcException(error);
    }
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom<Record<string, any>>(
      this.client.send(
        { cmd: OrdersCommands.CREATE_PAYMENT_SESSION },
        {
          orderId: order.id,
          currency: 'usd',
          items: order.OrderItem.map((orderItem) => ({
            name: orderItem.name,
            price: orderItem.price,
            quantity: orderItem.quantity,
          })),
        },
      ),
    );

    return paymentSession;
  }

  async findAll(orderPagination: OrderPaginationDto) {
    const { page = 1, limit = 10 } = orderPagination;

    const skip = (page - 1) * limit;
    const totalCount = await this.orders.count();
    const orders = await this.orders.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: {
        status: orderPagination.status,
        paid: orderPagination.paid,
      },
    });

    return {
      data: orders,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findAllByStatus(orderPagination: OrderPaginationDto) {
    const { page = 1, limit = 10 } = orderPagination;

    const skip = (page - 1) * limit;
    const totalCount = await this.orders.count();
    const orders = await this.orders.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: { status: orderPagination.status },
    });

    return {
      data: orders,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: string) {
    Logger.log(`Finding order with id ${id}...`, this.constructor.name);
    const order = await this.orders.findUnique({
      where: { id },
      include: {
        OrderItem: {
          select: {
            productId: true,
            price: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      Logger.error(`Order with id ${id} not found`, this.constructor.name);
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const productsIds = order.OrderItem.map((orderItem) => orderItem.productId);

    const productsExist = await this.getProductsByIds({
      productsIds,
    });

    const orderWithItems = {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: productsExist.find((p) => p.id === orderItem.productId).name,
      })),
    };

    return orderWithItems;
  }

  async changeOrderStatus(updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(updateOrderDto.id);

    if (!order) {
      throw new RpcException({
        message: `Order with id ${updateOrderDto.id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return this.orders.update({
      where: { id: updateOrderDto.id },
      data: { status: updateOrderDto.status },
    });
  }

  async getProducts({ orderItems }: { orderItems: OrderItems[] }) {
    const productsExist: {
      id: number;
      price: number;
      name: string;
    }[] = await firstValueFrom(
      this.client.send(
        { cmd: ProductsCommands.VALIDATE_PRODUCTS },
        { ids: orderItems.map((orderItem) => orderItem.productId) },
      ),
    );

    return productsExist;
  }

  private async getProductsByIds({
    productsIds,
  }: {
    productsIds: number[];
  }): Promise<
    {
      id: number;
      price: number;
      name: string;
    }[]
  > {
    return await firstValueFrom(
      this.client.send(
        { cmd: ProductsCommands.VALIDATE_PRODUCTS },
        { ids: productsIds },
      ),
    );
  }

  async paidOrder(payload: PaidOrderDto) {
    // console.log(payload);
    // update order status to paid
    const orderPaid = await this.orders.update({
      where: { id: payload.orderId },
      data: {
        status: OrderStatus.PAID,
        paid: true,
        paidAt: new Date(),
        stripeChargeId: payload.stripePaymentId,
        /* update by reltion */
        OrderReceipt: {
          create: {
            receipt: payload.receipUrl,
          },
        },
      },
    });

    return orderPaid;

    // could be update by $transaction
    // this.$transaction
  }
}
