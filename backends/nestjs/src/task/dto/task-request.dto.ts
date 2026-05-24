import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class TaskRequest {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsBoolean()
  completed: boolean;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsNotEmpty()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
