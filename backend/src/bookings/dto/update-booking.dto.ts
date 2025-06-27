import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  startLocation?: string;

  @IsOptional()
  @IsString()
  endLocation?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  pickupTime?: string;

  @IsOptional()
  @IsDateString()
  returnTime?: string;

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
