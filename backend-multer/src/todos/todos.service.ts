import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoFilterDto } from './dto/todo-filter.dto';

@Injectable()
export class TodosService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        userId,
      },
      include: {
        user: {
          select: { username: true, email: true, id: true }, 
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
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page = 1, 
      limit = 10 
    } = filterDto;

    const skip = (page - 1) * limit;

    let dateFilter: any = undefined;
    if (startDate && endDate) {
      const start = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`);
      const end = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
      dateFilter = {
        gte: start,
        lte: end,
      };
    } else if (startDate) {
      const start = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`);
      dateFilter = {
        gte: start,
      };
    } else if (endDate) {
      const end = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
      dateFilter = {
        lte: end,
      };
    } else if (dueDate) {
      const date = new Date(dueDate.includes('T') ? dueDate : `${dueDate}T00:00:00.000Z`);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      dateFilter = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const validSortFields = ['dueDate', 'createdAt', 'updatedAt', 'title', 'priority'];
    const orderField = validSortFields.includes(sortBy || '') ? sortBy! : 'createdAt';
    const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy: any = { [orderField]: orderDirection };

    const where: any = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(isCompleted !== undefined && { completed: isCompleted }),
      ...(isPublic !== undefined && { isPublic }),
      ...(dateFilter && { dueDate: dateFilter }),
    };

    const [todos, total, completedCount, pendingCount] = await this.prisma.$transaction([
      this.prisma.todo.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy,
        include: {
          user: {
            select: { id: true, username: true, name: true, email: true },
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

  async findPublic(filterDto: TodoFilterDto) {
    const { 
      search, 
      priority, 
      category, 
      isCompleted,
      dueDate,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page = 1, 
      limit = 10 
    } = filterDto;

    const skip = (page - 1) * limit;

    let dateFilter: any = undefined;
    if (startDate && endDate) {
      const start = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`);
      const end = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
      dateFilter = {
        gte: start,
        lte: end,
      };
    } else if (startDate) {
      const start = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`);
      dateFilter = {
        gte: start,
      };
    } else if (endDate) {
      const end = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`);
      dateFilter = {
        lte: end,
      };
    } else if (dueDate) {
      const date = new Date(dueDate.includes('T') ? dueDate : `${dueDate}T00:00:00.000Z`);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const validSortFields = ['dueDate', 'createdAt', 'updatedAt', 'title', 'priority'];
    const orderField = validSortFields.includes(sortBy || '') ? sortBy! : 'createdAt';
    const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy: any = { [orderField]: orderDirection };

    const where: any = {
      isPublic: true,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(isCompleted !== undefined && { completed: isCompleted }),
      ...(dateFilter && { dueDate: dateFilter }),
    };

    const [todos, total] = await this.prisma.$transaction([
      this.prisma.todo.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy,
        include: {
          user: {
            select: { id: true, username: true, name: true, email: true },
          },
        },
      }),
      this.prisma.todo.count({ where }),
    ]);

    return {
      data: todos,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, name: true, email: true } },
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

    // Jika lampiran berkas diganti atau dikosongkan, hapus berkas lama dari disk agar tidak ada data/storage leakage
    if (
      updateTodoDto.imagePath !== undefined &&
      todo.imagePath &&
      updateTodoDto.imagePath !== todo.imagePath
    ) {
      await this.uploadService.deleteFile(todo.imagePath);
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

    // Hapus berkas lampiran dari disk jika ada, mencegah orphan files
    if (todo.imagePath) {
      await this.uploadService.deleteFile(todo.imagePath);
    }

    return this.prisma.todo.delete({
      where: { id },
    });
  }
}