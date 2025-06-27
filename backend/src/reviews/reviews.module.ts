import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, PrismaService],
})
export class ReviewModule {}
