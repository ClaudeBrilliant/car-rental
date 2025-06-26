export interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  bookingId?: string | null;

  rating: number; // 1-5 stars
  title?: string | null;
  comment?: string | null;

  // Admin Response
  adminResponse?: string | null;
  respondedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
