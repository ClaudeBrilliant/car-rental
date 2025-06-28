export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  doors: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  isAvailable: boolean;
  location: string;
  licensePlate: string;
  mileage: number;
  description?: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum VehicleCategory {
  ECONOMY = 'economy',
  COMPACT = 'compact',
  MIDSIZE = 'midsize',
  FULLSIZE = 'fullsize',
  LUXURY = 'luxury',
  SUV = 'suv',
  CONVERTIBLE = 'convertible',
  VAN = 'van'
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CVT = 'cvt'
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  HYBRID = 'hybrid',
  ELECTRIC = 'electric'
}

export interface VehicleSearchFilter {
  category?: VehicleCategory[];
  transmission?: TransmissionType[];
  fuelType?: FuelType[];
  priceRange?: { min: number; max: number };
  seats?: number[];
  location?: string;
  pickupDate?: Date;
  returnDate?: Date;
  features?: string[];
}

export interface VehicleAvailability {
  vehicleId: string;
  available: boolean;
  availableDates: Date[];
  unavailableDates: Date[];
}