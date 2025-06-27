/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BookingService } from './bookings.service';
import { AdminUpdateBookingDto } from './dto/admin-update-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus, UserRole } from '@prisma/client';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create a new booking
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    // If user is not admin, ensure they can only create bookings for themselves
    if (
      !req.user.roles?.includes(UserRole.ADMIN) &&
      createBookingDto.userId !== req.user.id
    ) {
      createBookingDto.userId = req.user.id;
    }
    return this.bookingService.create(createBookingDto);
  }

  /**
   * Get all bookings (Admin only)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.bookingService.findAll();
  }

  /**
   * Get current user's bookings
   */
  @Get('my-bookings')
  async findMyBookings(@Request() req) {
    return this.bookingService.findByUser(req.user.id);
  }

  /**
   * Get bookings by user ID (Admin only)
   */
  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findByUser(@Param('userId') userId: string) {
    return this.bookingService.findByUser(userId);
  }

  /**
   * Get bookings by vehicle ID (Admin only)
   */
  @Get('vehicle/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.bookingService.findByVehicle(vehicleId);
  }

  /**
   * Get bookings by status (Admin and agent only)
   */
  @Get('status/:status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async findByStatus(@Param('status') status: BookingStatus) {
    return this.bookingService.findByStatus(status);
  }

  /**
   * Get pending bookings (Admin only)
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async findPendingBookings() {
    return this.bookingService.findByStatus(BookingStatus.PENDING);
  }

  /**
   * Get active bookings (Admin only)
   */
  @Get('active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async findActiveBookings() {
    const [approved, active] = await Promise.all([
      this.bookingService.findByStatus(BookingStatus.APPROVED),
      this.bookingService.findByStatus(BookingStatus.ACTIVE),
    ]);
    return [...approved, ...active];
  }

  /**
   * Get booking by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingService.findOne(id);

    // Non-admin users can only view their own bookings
    if (
      !req.user.roles?.includes(UserRole.ADMIN) &&
      booking.userId !== req.user.id
    ) {
      throw new UnauthorizedException('You can only view your own bookings');
    }

    return booking;
  }

  /**
   * Update booking (User can update their own, Admin can update any)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ) {
    const booking = await this.bookingService.findOne(id);

    // Non-admin users can only update their own bookings
    if (
      !req.user.roles?.includes(UserRole.ADMIN) &&
      booking.userId !== req.user.id
    ) {
      throw new UnauthorizedException('You can only update your own bookings');
    }

    return this.bookingService.update(id, updateBookingDto);
  }

  /**
   * Admin update booking (Admin only)
   */
  @Patch(':id/admin-update')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminUpdate(
    @Param('id') id: string,
    @Body() adminUpdateBookingDto: AdminUpdateBookingDto,
    @Request() req,
  ) {
    return this.bookingService.adminUpdate(
      id,
      adminUpdateBookingDto,
      req.user.id,
    );
  }

  /**
   * Approve booking (Admin only)
   */
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string, @Request() req) {
    return this.bookingService.adminUpdate(
      id,
      { status: BookingStatus.APPROVED },
      req.user.id,
    );
  }

  /**
   * Reject booking (Admin only)
   */
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
    @Request() req,
  ) {
    return this.bookingService.adminUpdate(
      id,
      {
        status: BookingStatus.REJECTED,
        rejectionReason: body.rejectionReason,
      },
      req.user.id,
    );
  }

  /**
   * Confirm booking (Admin only)
   */
  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async confirm(@Param('id') id: string, @Request() req) {
    return this.bookingService.adminUpdate(
      id,
      { status: BookingStatus.APPROVED },
      req.user.id,
    );
  }

  /**
   * Mark as picked up (Admin only)
   */
  @Patch(':id/pickup')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async pickup(
    @Param('id') id: string,
    @Body() body: { pickupCondition?: string; actualPickup?: string },
    @Request() req,
  ) {
    return this.bookingService.adminUpdate(
      id,
      {
        status: BookingStatus.ACTIVE,
        pickupCondition: body.pickupCondition,
        actualPickup: body.actualPickup,
      },
      req.user.id,
    );
  }

  /**
   * Mark as returned (Admin only)
   */
  @Patch(':id/return')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async return(
    @Param('id') id: string,
    @Body()
    body: {
      returnCondition?: string;
      damageNotes?: string;
      actualReturn?: string;
    },
    @Request() req,
  ) {
    return this.bookingService.adminUpdate(
      id,
      {
        status: BookingStatus.COMPLETED,
        returnCondition: body.returnCondition,
        damageNotes: body.damageNotes,
        actualReturn: body.actualReturn,
      },
      req.user.id,
    );
  }

  // /**
  //  * Complete booking (Admin only)
  //  */
  // // @Patch(':id/complete')
}
