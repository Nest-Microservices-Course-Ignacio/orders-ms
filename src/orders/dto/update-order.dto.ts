import { IsEnum, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enum/orderStatus.enum';

export class UpdateOrderDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(OrderStatus, {
    message: `status must be one of the following values: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus = OrderStatus.PENDING;
}
