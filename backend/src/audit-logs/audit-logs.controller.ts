import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuditLogService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit.dto';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  findAll() {
    return this.auditLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.auditLogService.delete(id);
  }
}
