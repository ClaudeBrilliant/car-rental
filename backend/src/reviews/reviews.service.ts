import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, RespondToReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    // Optionally verify that user and vehicle exist
    const [user, vehicle] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.userId } }),
      this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } }),
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    return this.prisma.review.create({
      data: dto,
      include: {
        user: true,
        vehicle: true,
      },
    });
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: true,
        vehicle: true, // Include vehicle info too
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        vehicle: true, // Include vehicle info
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVehicle(vehicleId: string) {
    return this.prisma.review.findMany({
      where: { vehicleId },
      include: {
        user: true, // Include user info
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToReview(dto: RespondToReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: dto.reviewId },
    });

    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id: dto.reviewId },
      data: {
        adminResponse: dto.response, // Use adminResponse field from schema
        respondedAt: new Date(),
      },
      include: {
        user: true,
        vehicle: true,
      },
    });
  }

  async delete(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.delete({ where: { id } });
  }
}
