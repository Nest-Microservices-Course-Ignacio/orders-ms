import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsNumber,
    IsOptional,
    IsPositive,
} from 'class-validator';
import { OrderStatus } from '../enum/orderStatus.enum';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalAmount: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalItem: number;

  @IsEnum(OrderStatus, {
    message: `status must be one of the following values: ${Object.values(OrderStatus).join(', ')}`,
  })
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  paid?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  paidAt?: Date;
}
