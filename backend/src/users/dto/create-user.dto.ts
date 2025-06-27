/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsUUID,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';
import { UserRole, AuthProvider } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  isActive: boolean;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
  avatar?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole = UserRole.CUSTOMER;

  @IsOptional()
  @IsEnum(AuthProvider, { message: 'Invalid auth provider' })
  authProvider?: AuthProvider = AuthProvider.EMAIL; // Assuming LOCAL is default

  @IsOptional()
  @IsString({ message: 'Provider ID must be a string' })
  @MaxLength(255, { message: 'Provider ID must not exceed 255 characters' })
  providerId?: string;

  @IsOptional()
  @IsString({ message: 'Profile image ID must be a string' })
  @MaxLength(255, {
    message: 'Profile image ID must not exceed 255 characters',
  })
  profileImageId?: string;

  @IsOptional()
  @IsString({ message: 'Profile image URL must be a string' })
  @MaxLength(500, {
    message: 'Profile image URL must not exceed 500 characters',
  })
  profileImageUrl?: string;
}

export class UserResponseDto {
  @Expose()
  @IsUUID(4, { message: 'Invalid user ID format' })
  id: string;

  @Expose()
  email: string;

  @Expose()
  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  name: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: UserRole;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Expose()
  phone: string | null;

  @Expose()
  authProvider: AuthProvider;

  @Expose()
  providerId: string | null;

  @Expose()
  lastLogin: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  profileImageId: string | null;

  @Expose()
  profileImageUrl: string | null;

  @Expose()
  avatar: string | null;

  // Excluded fields - these won't be returned in the response
  @Exclude()
  password: string;

  @Exclude()
  deletedAt: Date | null;

  @Exclude()
  emailVerifiedAt: Date | null;

  @Exclude()
  phoneVerifiedAt: Date | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  // Helper method to get full name
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Helper method to check if user has specific role
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  // Helper method to get display name (prefers full name, falls back to email)
  getDisplayName(): string {
    const fullName = this.getFullName();
    return fullName || this.email;
  }
}
