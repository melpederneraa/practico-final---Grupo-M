import { IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 128)
  name: string;
}
