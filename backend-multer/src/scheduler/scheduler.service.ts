import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SchedulerService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron('0 8 * * *')
  async handleDailyReminders() {
    console.log('--- Menjalankan Cron Job: Cek Deadline Tugas ---');

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

    console.log(`Ditemukan ${tasksDueTomorrow.length} tugas yang deadline besok.`);

    for (const todo of tasksDueTomorrow) {
      if (todo.user && todo.user.email) {
        await this.mailService.sendTodoReminder(todo.user, todo);
        console.log(`Reminder dikirim ke: ${todo.user.email} untuk tugas "${todo.title}"`);
      }
    }
  }
}