export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  additionalServices: AdditionalService[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: Vehicle;
  user?: User;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

export interface BookingRequest {
  vehicleId: string;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: string;
  returnLocation: string;
  additionalServices: string[];
  paymentMethodId: string;
}

export interface BookingSummary {
  vehicle: Vehicle;
  pickupDate: Date;
  returnDate: Date;
  days: number;
  basePrice: number;
  additionalServices: AdditionalService[];
  taxes: number;
  totalAmount: number;
}