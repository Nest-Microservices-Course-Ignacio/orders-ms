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

import { Prisma, PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { ProductsCommands } from 'src/common/cmd/products.cmd';
import { PRODUCTS_SERVICE } from 'src/config/services';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
  ) {
    super();
  }

  onModuleInit() {
    Logger.log('Database connected...', this.constructor.name);
    this.$connect();
  }

  async create(createOrderDto: CreateOrderDto) {
    Logger.log('Creating order...', this.constructor.name);

    // verify if the products exist
    try {
      const productsExist: {
        id: number;
        price: number;
        name: string;
      }[] = await firstValueFrom(
        this.productsClient.send(
          { cmd: ProductsCommands.VALIDATE_PRODUCTS },
          { ids: createOrderDto.items.map((item) => item.productId) },
        ),
      );

      const totalAmount = createOrderDto.items.reduce((sum, orderItem) => {
        const product = productsExist.find((p) => p.id === orderItem.productId);
        return sum + product!.price * orderItem.quantity;
      }, 0);

      const totalItem = createOrderDto.items.length;

      const orderCreated = (await this.orders.create({
        data: {
          totalAmount,
          totalItem,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                price: productsExist.find((p) => p.id === orderItem.productId)!
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
      })) as Prisma.OrdersGetPayload<{
        include: { OrderItem: true };
      }>;

      return {
        ...orderCreated,
        OrderItem: orderCreated.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: productsExist.find((p) => p.id === orderItem.productId)!.name,
        })),
      };
    } catch (error) {
      console.error(error);
      throw new RpcException(error);
    }
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
}
