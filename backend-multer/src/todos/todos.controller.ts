import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch, // Menggunakan Patch untuk partial update
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Pastikan interface User di request sesuai dengan return dari JwtStrategy
// Biasanya payload JWT berisi sub (id) dan username
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto'; 
import { handlePrismaError } from '../common/prisma-error.handler';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoFilterDto } from './dto/todo-filter.dto';

// Interface custom agar TypeScript mengenali req.user
interface RequestWithUser extends Request {
  user: {
    id: string;       // Ubah ini menyesuaikan output JwtStrategy Anda
    username: string;
    email: string;
  };
}

@Controller('todos')
@UseGuards(JwtAuthGuard) // Terapkan Guard di level controller agar semua route terproteksi
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  // 1. CREATE TODO
  // Requirement: "Create a task" [cite: 160]
  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req: RequestWithUser,
  ) {
    try {
      // Mengirim User ID dari JWT ke service
      return await this.todosService.create(req.user.id, createTodoDto);
    } catch (error) {
      handlePrismaError(error, 'Create todo');
    }
  }

  // 2. FIND ALL (Search, Filter, Pagination)
  // Requirement: "View all tasks", "Search and filter" [cite: 166, 169]
  @Get()
  @UsePipes(new ValidationPipe({ transform: true })) // Transform query params string ke tipe data asli
  async findAll(
    @Query() filterDto: TodoFilterDto, // Menangkap ?search=...&priority=...
    @Request() req: RequestWithUser,
  ) {
    try {
      return await this.todosService.findAll(req.user.id, filterDto);
    } catch (error) {
      handlePrismaError(error, 'Fetch todos');
    }
  }

  // 3. FIND ONE
  // Requirement: "See task details" [cite: 168]
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    try {
      return await this.todosService.findOne(id, req.user.id);
    } catch (error) {
      handlePrismaError(error, 'Fetch todo detail');
    }
  }

  // 4. UPDATE TODO
  // Requirement: "Mark tasks as complete", "Edit tasks" [cite: 171-172]
  @Patch(':id') // Menggunakan Patch karena kita update parsial
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req: RequestWithUser,
  ) {
    try {
      return await this.todosService.update(id, updateTodoDto, req.user.id);
    } catch (error) {
      handlePrismaError(error, 'Update todo');
    }
  }

  // 5. DELETE TODO
  // Requirement: "Delete my tasks" [cite: 172]
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    try {
      return await this.todosService.remove(id, req.user.id);
    } catch (error) {
      handlePrismaError(error, 'Delete todo');
    }
  }
}