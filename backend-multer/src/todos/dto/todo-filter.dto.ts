import { Type, Transform } from 'class-transformer';
import { 
  IsBoolean, 
  IsDate, 
  IsEnum, 
  IsInt, 
  IsOptional, 
  IsString, 
  Min 
} from 'class-validator';
import { TodoPriority } from './create-todo.dto';

export class TodoFilterDto {
  // User Story: "Search tasks by title"
  @IsOptional()
  @IsString()
  search?: string;

  // User Story: "Filter by priority"
  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  // User Story: "Filter by category"
  @IsOptional()
  @IsString()
  category?: string;

  // User Story: "Filter by status" (completed/incomplete)
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isCompleted?: boolean;

  // User Story: "Filter by visibility" (public/private)
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isPublic?: boolean;

  // User Story: "Filter by due date"
  @IsOptional()
  @IsString()
  dueDate?: string;


  // User Story: "List all tasks with pagination"
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1; // Default page 1

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10; // Default 10 item per halaman
}