import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit.dto';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return this.prisma.auditLog.delete({ where: { id } });
  }
}
