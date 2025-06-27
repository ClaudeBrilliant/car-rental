import { IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  action: string;

  @IsString()
  entity: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  oldData?: any;

  @IsOptional()
  newData?: any;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
