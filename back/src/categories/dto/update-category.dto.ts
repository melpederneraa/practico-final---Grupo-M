import { IsString, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @Length(1, 128)
  name: string;
}
