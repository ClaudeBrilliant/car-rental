import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditLogController } from './audit-logs.controller';
import { AuditLogService } from './audit-logs.service';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, PrismaService],
})
export class AuditLogModule {}
