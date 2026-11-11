import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private uploadService: UploadService,
  ) {}

  @Cron('0 8 * * *', { timeZone: 'Asia/Jakarta' })
  // @Cron('*/1 * * * *')
  async handleDailyReminders() {
    this.logger.log('--- Menjalankan Cron Job: Cek Deadline Tugas ---');

    // Menentukan rentang waktu "Besok"
    const today = new Date();
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(today.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const tasksDueTomorrow = await this.prisma.todo.findMany({
      where: {
        dueDate: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
        completed: false,
      },
      include: {
        user: true, 
      },
    });

    this.logger.log(`Ditemukan ${tasksDueTomorrow.length} tugas yang deadline besok.`);

    for (const todo of tasksDueTomorrow) {
      if (todo.user && todo.user.email) {
        await this.mailService.sendTodoReminder(todo.user, todo);
        this.logger.log(`Reminder dikirim ke: ${todo.user.email} untuk tugas "${todo.title}"`);
      }
    }
  }

  /**
   * Cron Job Pembersihan Berkas Orphan (Storage Leakage Prevention)
   * Berjalan otomatis setiap hari pada pukul 02:00 WIB untuk membersihkan berkas
   * pada folder uploads yang tidak ditautkan ke database Todo manapun.
   */
  @Cron('0 2 * * *', { timeZone: 'Asia/Jakarta' })
  async handleDailyStorageCleanup() {
    this.logger.log('--- Menjalankan Cron Job: Pembersihan Berkas Orphan (Storage Leakage Prevention) ---');
    const result = await this.uploadService.cleanOrphanFiles(60); // Hapus berkas tak bertuan dengan umur > 60 menit
    this.logger.log(`Hasil pembersihan berkas orphan: ${result.deleted} file terhapus dari ${result.scanned} file dipindai.`);
  }
}
