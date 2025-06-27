import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  password: string | null;
  role: UserRole;
  isActive: boolean;
  providerId: string | null;
  profileImageId: string | null;
  profileImageUrl: string | null;
  avatar: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
