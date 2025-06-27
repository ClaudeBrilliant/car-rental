import { IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  startLocation: string;

  @IsOptional()
  @IsString()
  endLocation?: string;

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
}
