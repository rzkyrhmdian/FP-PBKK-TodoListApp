import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User, Todo } from '@prisma/client'; 

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  /**
   * Cek apakah mail service berjalan dalam mock mode.
   * Aktif jika MAIL_MOCK=true atau kredensial SMTP bernilai default/dummy.
   */
  private isMockMode(): boolean {
    const mailMock = process.env.MAIL_MOCK?.toLowerCase() === 'true';
    const mailPass = process.env.MAIL_PASS;
    const isDummyPass = !mailPass || mailPass === 'dummy_password' || mailPass === 'your-password';
    return mailMock || isDummyPass;
  }

  async sendTodoReminder(user: User, todo: Todo): Promise<{ success: boolean; mocked: boolean }> {
    const formattedDueDate = todo.dueDate
      ? new Date(todo.dueDate).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Hari ini';

    // Jika mode mock aktif, simulasikan pengiriman tanpa membebani koneksi SMTP
    if (this.isMockMode()) {
      this.logger.log(
        `[MOCK EMAIL REMINDER] Kepada: ${user.email} (${user.name || user.username}) | Tugas: "${todo.title}" | Tenggat: ${formattedDueDate} [Mode Mock Aktif]`,
      );
      return { success: true, mocked: true };
    }

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reminder: Tugas Anda Segera Berakhir! - TodoFlow',
        template: './reminder',
        context: { 
          name: user.name || user.username,
          title: todo.title,
          dueDate: formattedDueDate,
        },
      });
      this.logger.log(`Email reminder berhasil terkirim via SMTP ke ${user.email}`);
      return { success: true, mocked: false };
    } catch (error: any) {
      this.logger.warn(
        `Gagal mengirim email via SMTP (${error?.message || error}). Mengalihkan ke pencatatan log reminder (fallback).`,
      );
      this.logger.log(
        `[FALLBACK EMAIL REMINDER] Kepada: ${user.email} (${user.name || user.username}) | Tugas: "${todo.title}" | Tenggat: ${formattedDueDate}`,
      );
      return { success: true, mocked: true };
    }
  }
}