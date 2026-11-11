import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, MailModule, UploadModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
