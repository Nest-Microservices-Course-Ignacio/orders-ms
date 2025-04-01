import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { Type } from 'class-transformer';

export class ActiveRecordsDto extends PaginationDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean = false;
}
