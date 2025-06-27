import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  VehicleCategory,
  VehicleStatus,
  FuelType,
  TransmissionType,
} from '@prisma/client';

export class VehicleQueryDto {
  @IsOptional()
  @IsEnum(VehicleCategory)
  category?: VehicleCategory;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
