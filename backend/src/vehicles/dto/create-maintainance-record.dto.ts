import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateMaintenanceRecordDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsDateString()
  serviceDate: string;

  @IsDateString()
  @IsOptional()
  nextService?: string;
}
