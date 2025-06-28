export interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface ReviewRequest {
  vehicleId: string;
  bookingId: string;
  rating: number;
  comment: string;
}