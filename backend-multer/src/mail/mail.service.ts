import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User, Todo } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendTodoReminder(user: User, todo: Todo) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reminder: Tugas Anda Segera Berakhir!',
        template: './reminder',
        context: { 
          name: user.username,
          title: todo.title,
          dueDate: todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'Hari ini',
        },
      });
      console.log(`Email terkirim ke ${user.email}`);
    } catch (error) {
      console.error('Gagal mengirim email:', error);
    }
  }
}