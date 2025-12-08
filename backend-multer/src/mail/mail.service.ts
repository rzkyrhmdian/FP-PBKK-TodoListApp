import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User, Todo } from '@prisma/client'; // Import tipe data dari Prisma

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  // User Story: "Email notification when a task deadline is approaching" [cite: 182]
  async sendTodoReminder(user: User, todo: Todo) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reminder: Tugas Anda Segera Berakhir!',
        template: './reminder', // Nama file template tanpa ekstensi .hbs
        context: { 
          // Data yang akan dikirim ke template HTML
          name: user.username,
          title: todo.title,
          dueDate: todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'Hari ini',
        },
      });
      console.log(`Email terkirim ke ${user.email}`);
    } catch (error) {
      console.error('Gagal mengirim email:', error);
      // Jangan throw error agar cron job tidak berhenti total jika satu email gagal
    }
  }
}