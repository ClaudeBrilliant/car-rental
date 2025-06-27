import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PermissionsService } from 'src/auth/services/permission.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PermissionsService, PrismaService],
})
export class UsersModule {}
