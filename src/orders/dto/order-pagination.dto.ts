import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderStatus } from '../enum/orderStatus.enum';

export class OrderPaginationDto extends PaginationDto {
  @IsEnum(OrderStatus, {
    message: `status must be one of the following values: ${Object.values(OrderStatus).join(', ')}`,
  })
  @IsOptional()
  status?: OrderStatus;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  paid?: boolean;
} 