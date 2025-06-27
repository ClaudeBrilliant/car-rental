import { Module } from '@nestjs/common';
import { BookingService } from './bookings.service';
import { BookingController } from './bookings.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService],
})
export class BookingsModule {}
