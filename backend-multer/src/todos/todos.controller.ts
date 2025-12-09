import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto'; 
import { handlePrismaError } from '../common/prisma-error.handler';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoFilterDto } from './dto/todo-filter.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

@Controller('todos')
@UseGuards(JwtAuthGuard) 
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req: RequestWithUser,
  ) {
    try {
      return await this.todosService.create(req.user.id, createTodoDto);
    } catch (error) {
      handlePrismaError(error, 'Create todo');
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(
    @Query() filterDto: TodoFilterDto,
    @Request() req: RequestWithUser,
  ) {
    try {
      return await this.todosService.findAll(req.user.id, filterDto);
    } catch (error) {
      handlePrismaError(error, 'Fetch todos');
    }
  }

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

  @Patch(':id')
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