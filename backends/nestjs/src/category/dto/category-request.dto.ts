import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  color: string;
}
