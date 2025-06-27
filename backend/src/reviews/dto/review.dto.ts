import { IsString, IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  vehicleId: string; // This was missing!

  @IsOptional()
  @IsString()
  @IsUUID()
  bookingId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class RespondToReviewDto {
  @IsString()
  @IsUUID()
  reviewId: string;

  @IsString()
  response: string;
}
