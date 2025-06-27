import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateVehicleImageDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = false;
}
