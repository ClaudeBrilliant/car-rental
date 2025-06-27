import { IsString, IsOptional } from 'class-validator';

export class CancelBookingDto {
  @IsString()
  cancellationReason: string;

  @IsOptional()
  @IsString()
  cancelledBy?: string;
}
