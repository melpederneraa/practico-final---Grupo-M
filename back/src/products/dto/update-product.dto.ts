import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(1, 256)
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  categoryId?: number | null;
}
