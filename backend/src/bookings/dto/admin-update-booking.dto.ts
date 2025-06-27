import { BookingStatus } from '@prisma/client';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';

export class AdminUpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @IsOptional()
  @IsDateString()
  actualPickup?: string;

  @IsOptional()
  @IsDateString()
  actualReturn?: string;

  @IsOptional()
  @IsString()
  pickupCondition?: string;

  @IsOptional()
  @IsString()
  returnCondition?: string;

  @IsOptional()
  @IsString()
  damageNotes?: string;
}
