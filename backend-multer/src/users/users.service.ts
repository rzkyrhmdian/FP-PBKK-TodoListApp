import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // GET USER PUBLIC TODOS
  async getUserPublicTodos(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const todos = await this.prisma.todo.findMany({
      where: {
        userId,
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
      todos,
    };
  }

  // SEARCH USERS
  async searchUsers(search: string) {
    if (!search) return [];

    return this.prisma.user.findMany({
      where: {
      OR: [
        {
          username: {
            contains: search.toLowerCase(),
          },
        },
        {
          name: {
            contains: search.toLowerCase(),
          },
        },
        {
          email: {
            contains: search.toLowerCase(),
          },
        },
      ],
    },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
      },
    });
  }
}
