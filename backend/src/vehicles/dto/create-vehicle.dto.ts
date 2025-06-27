import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsNotEmpty,
  Length,
} from 'class-validator';
import {
  FuelType,
  TransmissionType,
  VehicleCategory,
  VehicleStatus,
} from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  licensePlate: string;

  @IsString()
  @IsOptional()
  @Length(17, 17)
  vin?: string;

  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsNumber()
  @Min(1)
  @Max(50)
  seatingCapacity: number;

  @IsNumber()
  @Min(2)
  @Max(6)
  doors: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  mileage?: number;

  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsBoolean()
  hasAC: boolean;

  @IsBoolean()
  hasGPS: boolean;

  @IsBoolean()
  hasBluetooth: boolean;

  @IsBoolean()
  hasWifi: boolean;

  @IsBoolean()
  hasUSB: boolean;

  @IsBoolean()
  hasSunroof: boolean;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus = VehicleStatus.AVAILABLE;

  @IsString()
  @IsOptional()
  currentLocation?: string;

  @IsDateString()
  @IsOptional()
  lastServiceDate?: string;

  @IsDateString()
  @IsOptional()
  nextServiceDate?: string;

  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;
}
