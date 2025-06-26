import {
  FuelType,
  TransmissionType,
  VehicleCategory,
  VehicleStatus,
} from '@prisma/client';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin?: string | null;
  category: VehicleCategory;
  transmission: TransmissionType;
  fuelType: FuelType;
  seatingCapacity: number;
  doors: number;
  mileage?: number | null;

  // Pricing
  pricePerHour: number;
  pricePerDay: number;

  // Features
  hasAC: boolean;
  hasGPS: boolean;
  hasBluetooth: boolean;
  hasWifi: boolean;
  hasUSB: boolean;
  hasSunroof: boolean;

  // Status & Location
  status: VehicleStatus;
  currentLocation?: string | null;

  // Maintenance
  lastServiceDate?: Date | null;
  nextServiceDate?: Date | null;
  insuranceExpiry?: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  serviceDate: Date;
  nextService?: Date | null;
  createdAt: Date;
}
