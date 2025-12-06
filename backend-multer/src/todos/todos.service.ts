import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoFilterDto } from './dto/todo-filter.dto';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        userId,
      },
      include: {
        user: {
          select: { username: true, email: true }, 
        },
      },
    });
  }

  async findAll(userId: string, filterDto: TodoFilterDto) {
    const { 
      search, 
      priority, 
      category, 
      isCompleted,
      isPublic,
      dueDate,
      page = 1, 
      limit = 10 
    } = filterDto;

    const skip = (page - 1) * limit;

    let dateFilter: any = undefined;
      if (dueDate) {
    // treat as UTC date from FE
    const date = new Date(dueDate + "T00:00:00.000Z");

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    dateFilter = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }


    const where = {
      OR: [
        {
          userId,
          ...(search && {
            title: { contains: search },
          }),
          ...(priority && { priority }),
          ...(category && { category }),
          ...(isCompleted !== undefined && { completed: isCompleted }),
          ...(isPublic !== undefined && { isPublic }),
          ...(dueDate && { dueDate: dateFilter }),
        },
        {
          // Public todos from other users
          userId: { not: userId }, // Dari user lain
          isPublic: true,
          ...(search && {
            title: { contains: search },
          }),
          ...(priority && { priority }),
          ...(category && { category }),
          ...(isCompleted !== undefined && { completed: isCompleted }),
          ...(dueDate && { dueDate: dateFilter }),
        },
      ],
    };

    const [todos, total, completedCount, pendingCount] = await this.prisma.$transaction([
      this.prisma.todo.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: { username: true, id: true },
          },
        },
      }),
      this.prisma.todo.count({ where }),
      this.prisma.todo.count({ where: { ...where, completed: true } }),
      this.prisma.todo.count({ where: { ...where, completed: false } }),
    ]);

    return {
      data: todos,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        completedCount,
        pendingCount,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        user: { select: { username: true } },
      },
    });

    if (!todo) {
      throw new NotFoundException(`Todo dengan ID ${id} tidak ditemukan`);
    }

    if (todo.userId !== userId && !todo.isPublic) {
      throw new ForbiddenException('Anda tidak memiliki akses ke todo ini');
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      throw new NotFoundException('Todo tidak ditemukan');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('Anda hanya bisa mengedit todo milik sendiri');
    }

    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  async remove(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      throw new NotFoundException('Todo tidak ditemukan');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('Anda hanya bisa menghapus todo milik sendiri');
    }

    return this.prisma.todo.delete({
      where: { id },
    });
  }
}