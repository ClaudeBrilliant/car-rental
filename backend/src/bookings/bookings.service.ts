/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Booking, BookingStatus } from '@prisma/client';
import { AdminUpdateBookingDto } from './dto/admin-update-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Decimal } from 'generated/prisma/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new booking
   */
  async create(data: CreateBookingDto): Promise<Booking> {
    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      // Validate dates
      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }

      if (startDate < new Date()) {
        throw new BadRequestException('Start date cannot be in the past');
      }

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${data.userId} not found`);
      }

      // Check if vehicle exists
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException(
          `Vehicle with ID ${data.vehicleId} not found`,
        );
      }

      if (vehicle.status !== 'AVAILABLE') {
        throw new ConflictException('Vehicle is not available for booking');
      }

      // Check for booking conflicts
      const conflictingBookings = await this.prisma.booking.findMany({
        where: {
          vehicleId: data.vehicleId,
          status: {
            in: [
              'PENDING',
              'APPROVED',
              'REJECTED',
              'ACTIVE',
              'COMPLETED',
              'CANCELLED',
            ],
          },
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gt: startDate } },
              ],
            },
            {
              AND: [
                { startDate: { lt: endDate } },
                { endDate: { gte: endDate } },
              ],
            },
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } },
              ],
            },
          ],
        },
      });

      if (conflictingBookings.length > 0) {
        throw new ConflictException(
          'Vehicle is already booked for the selected dates',
        );
      }

      // Calculate total days and estimated amount
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const estimatedAmount = Number(vehicle.pricePerDay) * totalDays;

      // Generate booking number
      const bookingNumber = this.generateBookingNumber();

      const booking = await this.prisma.booking.create({
        data: {
          bookingNumber,
          userId: data.userId,
          vehicleId: data.vehicleId,
          startDate,
          endDate,
          startLocation: data.startLocation,
          endLocation: data.endLocation,
          totalDays,
          estimatedAmount,
          status: BookingStatus.PENDING,
          customerNotes: data.customerNotes,
          phoneNumber: data.phoneNumber,
          pickupTime: data.pickupTime ? new Date(data.pickupTime) : null,
          returnTime: data.returnTime ? new Date(data.returnTime) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              email: true,
              phone: true,
            },
          },
          vehicle: {
            // include other valid relations if needed
          },
        },
      });

      return this.mapPrismaBookingToInterface(booking);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create booking');
    }
  }

  /**
   * Find all bookings
   */
  async findAll(): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return bookings.map((booking) =>
        this.mapPrismaBookingToInterface(booking),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve bookings',
        error,
      );
    }
  }

  /**
   * Find booking by ID
   */
  async findOne(id: string): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      return this.mapPrismaBookingToInterface(booking);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve booking');
    }
  }

  /**
   * Find bookings by user ID
   */
  async findByUser(userId: string): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });

      return bookings.map((booking) =>
        this.mapPrismaBookingToInterface(booking),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve user bookings',
        error,
      );
    }
  }

  /**
   * Find bookings by vehicle ID
   */
  async findByVehicle(vehicleId: string): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { vehicleId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });

      return bookings.map((booking) =>
        this.mapPrismaBookingToInterface(booking),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve vehicle bookings',
        error,
      );
    }
  }

  /**
   * Find bookings by status
   */
  async findByStatus(status: BookingStatus): Promise<Booking[]> {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: { status },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
      });

      return bookings.map((booking) =>
        this.mapPrismaBookingToInterface(booking),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve bookings by status',
        error,
      );
    }
  }

  /**
   * Update booking
   */
  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    try {
      const existingBooking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      // Only allow updates if booking is in modifiable status
      if (!['PENDING', 'APPROVED'].includes(existingBooking.status)) {
        throw new ConflictException(
          'Booking cannot be modified in current status',
        );
      }

      const updateData: any = {};

      // Handle date updates
      if (data.startDate || data.endDate) {
        const startDate = data.startDate
          ? new Date(data.startDate)
          : existingBooking.startDate;
        const endDate = data.endDate
          ? new Date(data.endDate)
          : existingBooking.endDate;

        if (startDate >= endDate) {
          throw new BadRequestException('End date must be after start date');
        }

        updateData.startDate = startDate;
        updateData.endDate = endDate;
        updateData.totalDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      // Add other fields
      if (data.startLocation) updateData.startLocation = data.startLocation;
      if (data.endLocation !== undefined)
        updateData.endLocation = data.endLocation;
      if (data.customerNotes !== undefined)
        updateData.customerNotes = data.customerNotes;
      if (data.phoneNumber !== undefined)
        updateData.phoneNumber = data.phoneNumber;
      if (data.pickupTime) updateData.pickupTime = new Date(data.pickupTime);
      if (data.returnTime) updateData.returnTime = new Date(data.returnTime);

      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return this.mapPrismaBookingToInterface(updatedBooking);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update booking');
    }
  }

  /**
   * Admin update booking
   */
  async adminUpdate(
    id: string,
    data: AdminUpdateBookingDto,
    adminId: string,
  ): Promise<Booking> {
    try {
      const existingBooking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      const updateData: any = {
        reviewedBy: adminId,
        reviewedAt: new Date(),
      };

      if (data.status) updateData.status = data.status;
      if (data.rejectionReason)
        updateData.rejectionReason = data.rejectionReason;
      if (data.adminNotes) updateData.adminNotes = data.adminNotes;
      if (data.actualPickup)
        updateData.actualPickup = new Date(data.actualPickup);
      if (data.actualReturn)
        updateData.actualReturn = new Date(data.actualReturn);
      if (data.pickupCondition)
        updateData.pickupCondition = data.pickupCondition;
      if (data.returnCondition)
        updateData.returnCondition = data.returnCondition;
      if (data.damageNotes) updateData.damageNotes = data.damageNotes;

      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return this.mapPrismaBookingToInterface(updatedBooking);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update booking');
    }
  }

  /**
   * Cancel booking
   */
  async cancel(id: string, data: CancelBookingDto): Promise<Booking> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new ConflictException('Booking is already cancelled');
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new ConflictException('Cannot cancel a completed booking');
      }

      const cancelledBooking = await this.prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: data.cancellationReason,
          cancelledAt: new Date(),
          cancelledBy: data.cancelledBy,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return this.mapPrismaBookingToInterface(cancelledBooking);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to cancel booking');
    }
  }

  /**
   * Delete booking
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          user: { select: { firstName: true } },
          vehicle: { select: { make: true, model: true } },
        },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      await this.prisma.booking.delete({
        where: { id },
      });

      return {
        message: `Booking ${booking.bookingNumber} for ${booking.user.firstName} has been deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete booking');
    }
  }

  /**
   * Generate unique booking number
   */
  private generateBookingNumber(): string {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
  /**
   * Map Prisma Booking to interface
   */
  private mapPrismaBookingToInterface(booking: any): Booking {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
      vehicleId: booking.vehicleId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      startLocation: booking.startLocation,
      endLocation: booking.endLocation,
      totalDays: booking.totalDays,
      estimatedAmount: Decimal(booking.estimatedAmount),
      status: booking.status,
      reviewedBy: booking.reviewedBy,
      reviewedAt: booking.reviewedAt,
      rejectionReason: booking.rejectionReason,
      adminNotes: booking.adminNotes,
      customerNotes: booking.customerNotes,
      phoneNumber: booking.phoneNumber,
      pickupTime: booking.pickupTime,
      returnTime: booking.returnTime,
      actualPickup: booking.actualPickup,
      actualReturn: booking.actualReturn,
      pickupCondition: booking.pickupCondition,
      returnCondition: booking.returnCondition,
      damageNotes: booking.damageNotes,
      cancellationReason: booking.cancellationReason,
      cancelledAt: booking.cancelledAt,
      cancelledBy: booking.cancelledBy,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
