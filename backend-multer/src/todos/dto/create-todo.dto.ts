import { Type } from 'class-transformer';
import { 
  IsBoolean, 
  IsDate, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString 
} from 'class-validator';

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTodoDto {
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TodoPriority, { 
    message: 'Priority harus berupa low, medium, atau high' 
  })
  priority?: TodoPriority;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  category?: TodoPriority;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}