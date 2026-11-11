import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // GET CURRENT USER PROFILE & STATS (Fase 1.5)
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Profil pengguna tidak ditemukan');
    }

    const [totalTodos, completedTodos, pendingTodos, publicTodos] = await Promise.all([
      this.prisma.todo.count({ where: { userId } }),
      this.prisma.todo.count({ where: { userId, completed: true } }),
      this.prisma.todo.count({ where: { userId, completed: false } }),
      this.prisma.todo.count({ where: { userId, isPublic: true } }),
    ]);

    return {
      user,
      stats: {
        totalTodos,
        completedTodos,
        pendingTodos,
        publicTodos,
      },
    };
  }

  // UPDATE CURRENT USER PROFILE (Fase 1.5)
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email sudah digunakan oleh akun lain');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Profil berhasil diperbarui',
      user: updatedUser,
    };
  }

  // CHANGE PASSWORD (Fase 1.5)
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password lama tidak sesuai');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      message: 'Password berhasil diubah. Silakan gunakan password baru untuk login berikutnya.',
    };
  }

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
