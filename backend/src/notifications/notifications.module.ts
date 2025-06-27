import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
})
export class NotificationModule {}
