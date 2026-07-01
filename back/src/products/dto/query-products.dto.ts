import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['id', 'name', 'price', 'stock'])
  sortBy?: 'id' | 'name' | 'price' | 'stock';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  order?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
