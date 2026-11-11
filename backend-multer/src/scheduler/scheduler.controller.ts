import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('trigger-reminders')
  @UseGuards(JwtAuthGuard)
  async triggerReminders() {
    return this.schedulerService.triggerReminders();
  }

  @Post('trigger-cleanup')
  @UseGuards(JwtAuthGuard)
  async triggerCleanup() {
    return this.schedulerService.handleDailyStorageCleanup();
  }

  @Get('status')
  getStatus() {
    return {
      status: 'active',
      reminderSchedule: 'Hourly (0 * * * *)',
      storageCleanupSchedule: 'Daily 02:00 WIB (0 2 * * *)',
      timestamp: new Date().toISOString(),
    };
  }
}

