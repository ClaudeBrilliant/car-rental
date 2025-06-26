import { BookingStatus } from '@prisma/client';

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  vehicleId: string;

  // Booking Details
  startDate: Date;
  endDate: Date;
  startLocation: string;
  endLocation?: string | null;

  // Pricing
  totalDays: number;
  estimatedAmount: number;

  // Request Status
  status: BookingStatus;

  // Admin Actions
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;

  // Customer Info
  customerNotes?: string | null;
  phoneNumber?: string | null;

  // Pickup/Return Details
  pickupTime?: Date | null;
  returnTime?: Date | null;
  actualPickup?: Date | null;
  actualReturn?: Date | null;

  // Vehicle Condition
  pickupCondition?: string | null;
  returnCondition?: string | null;
  damageNotes?: string | null;

  // Cancellation
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
