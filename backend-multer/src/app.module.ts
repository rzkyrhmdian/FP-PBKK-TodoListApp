import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 1. Untuk membaca .env
import { ServeStaticModule } from '@nestjs/serve-static'; // 2. Untuk akses gambar upload
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module'; // 3. Menggantikan PostsModule
import { UploadModule } from './upload/upload.module';
import { PrismaModule } from './prisma/prisma.module'; // 4. Module Global Database
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { RtStrategy } from './auth/strategy/rt.strategy';
import { AuthService } from './auth/auth.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // A. Load Environment Variables (.env) secara global
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // B. Konfigurasi agar folder 'uploads' bisa diakses browser
    // Contoh akses: http://localhost:3000/uploads/gambar-anda.jpg
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads',
    }),

    // C. Module Fitur
    PrismaModule, // Pastikan PrismaService sudah dibungkus module (Best Practice)
    AuthModule,
    TodosModule,  // Modul utama Todo List
    UploadModule, // Modul File Upload
    ScheduleModule.forRoot(),
    MailModule, // (Akan kita tambahkan setelah ini)
  ],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule {}