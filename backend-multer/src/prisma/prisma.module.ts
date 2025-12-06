import { Global, Module } from '@nestjs/common';
import { PrismaService } from './../prisma.service';

@Global() // <--- 1. Tambahkan ini agar Service bisa dipakai di semua module (Auth, Todos, dll)
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- 2. WAJIB ADA: Agar module lain bisa menggunakan service ini
})
export class PrismaModule {}