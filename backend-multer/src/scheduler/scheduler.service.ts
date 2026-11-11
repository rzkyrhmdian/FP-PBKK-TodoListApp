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

  /**
   * Cron Job: Cek & Kirim Pengingat Email Otomatis.
   * Berjalan setiap jam untuk memindai tugas yang mendekati deadline (24 jam ke depan),
   * belum selesai (completed = false), dan belum pernah dikirimkan pengingat (reminderSent = false).
   */
  @Cron('0 * * * *', { timeZone: 'Asia/Jakarta' })
  async handleHourlyReminders() {
    this.logger.log('--- Menjalankan Cron Job: Pemindaian Deadline Pengingat Email ---');
    await this.triggerReminders();
  }

  /**
   * Eksekusi pemindaian pengingat tugas (dapat dipanggil otomatis oleh Cron atau manual via Endpoint)
   */
  async triggerReminders() {
    const now = new Date();
    // Cari tugas dengan tenggat dalam rentang waktu 24 jam ke depan (atau yang sudah terlewat sedikit hari ini tapi belum diingatkan)
    const reminderWindowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingTasks = await this.prisma.todo.findMany({
      where: {
        dueDate: {
          lte: reminderWindowEnd,
        },
        completed: false,
        reminderSent: false,
      },
      include: {
        user: true, 
      },
    });

    this.logger.log(
      `Ditemukan ${upcomingTasks.length} tugas yang perlu dikirimi pengingat (belum diingatkan).`,
    );

    let sentCount = 0;
    const details: Array<{ todoId: string; title: string; recipient: string; mocked: boolean }> = [];

    for (const todo of upcomingTasks) {
      if (todo.user && todo.user.email) {
        const sendResult = await this.mailService.sendTodoReminder(todo.user, todo);
        if (sendResult.success) {
          // Tandai reminderSent = true agar tidak dikirim berulang kali (Fase 1.4)
          await this.prisma.todo.update({
            where: { id: todo.id },
            data: { reminderSent: true },
          });

          sentCount++;
          details.push({
            todoId: todo.id,
            title: todo.title,
            recipient: todo.user.email,
            mocked: sendResult.mocked,
          });
        }
      }
    }

    this.logger.log(`Selesai memproses pengingat: ${sentCount}/${upcomingTasks.length} reminder berhasil tercatat.`);
    return {
      message: 'Pemrosesan reminder selesai',
      scanned: upcomingTasks.length,
      sent: sentCount,
      details,
      timestamp: new Date().toISOString(),
    };
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
    return result;
  }
}
