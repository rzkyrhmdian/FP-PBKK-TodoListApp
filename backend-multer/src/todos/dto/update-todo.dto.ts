import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  // User Story: "Mark tasks as complete/incomplete" [cite: 171]
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  // Field ini diupdate biasanya via controller setelah file upload sukses
  // User Story: "Optional: attach files" [cite: 165]
  @IsOptional()
  @IsString()
  imagePath?: string;
}