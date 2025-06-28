import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Enums based on your Prisma model
export enum VehicleCategory {
  ECONOMY = 'ECONOMY',
  COMPACT = 'COMPACT',
  MIDSIZE = 'MIDSIZE',
  FULLSIZE = 'FULLSIZE',
  LUXURY = 'LUXURY',
  SUV = 'SUV',
  TRUCK = 'TRUCK',
  VAN = 'VAN'
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT'
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate?: string;
  vin?: string;
  category: VehicleCategory;
  transmission: TransmissionType;
  fuelType: FuelType;
  seatingCapacity: number;
  doors: number;
  mileage?: number;
  pricePerHour: number;
  pricePerDay: number;
  hasAC: boolean;
  hasGPS: boolean;
  hasBluetooth: boolean;
  hasWifi: boolean;
  hasUSB: boolean;
  hasSunroof: boolean;
  status: VehicleStatus;
  currentLocation?: string;
  images?: string[];
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  insuranceExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  category: string;
  transmission: string;
  fuelType: string;
  status: string;
  availableOnly: boolean;
  priceRange: {
    min: number;
    max: number;
  };
}

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.html',
  styleUrls: ['./vehicle.css']
})
export class VehicleComponent implements OnInit {
  // Signals for reactive state management
  vehicles = signal<Vehicle[]>([]);
  selectedVehicleId = signal<string>('');
  showFilters = signal<boolean>(false);
  searchTerm = signal<string>('');
  
  // Filter signal
  filterSignal = signal<FilterOptions>({
    category: '',
    transmission: '',
    fuelType: '',
    status: '',
    availableOnly: false,
    priceRange: { min: 0, max: 1000 }
  });

  // Computed signals
  filteredVehicles = computed(() => {
    const vehicles = this.vehicles();
    const filters = this.filterSignal();
    const search = this.searchTerm().toLowerCase();

    return vehicles.filter(vehicle => {
      // Search filter
      const matchesSearch = !search || 
        vehicle.make.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.color.toLowerCase().includes(search) ||
        vehicle.licensePlate?.toLowerCase().includes(search);

      // Category filter
      const matchesCategory = !filters.category || vehicle.category === filters.category;
      
      // Transmission filter
      const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission;
      
      // Fuel type filter
      const matchesFuelType = !filters.fuelType || vehicle.fuelType === filters.fuelType;
      
      // Status filter
      const matchesStatus = !filters.status || vehicle.status === filters.status;
      
      // Available only filter
      const matchesAvailable = !filters.availableOnly || vehicle.status === VehicleStatus.AVAILABLE;
      
      // Price range filter
      const matchesPrice = vehicle.pricePerDay >= filters.priceRange.min && 
                          vehicle.pricePerDay <= filters.priceRange.max;

      return matchesSearch && matchesCategory && matchesTransmission && 
             matchesFuelType && matchesStatus && matchesAvailable && matchesPrice;
    });
  });

  // Vehicle statistics computed signal
  vehicleStats = computed(() => {
    const vehicles = this.vehicles();
    const available = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length;
    const rented = vehicles.filter(v => v.status === VehicleStatus.RENTED).length;
    const maintenance = vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length;
    const outOfService = vehicles.filter(v => v.status === VehicleStatus.OUT_OF_SERVICE).length;
    
    return {
      total: vehicles.length,
      available,
      rented,
      maintenance,
      outOfService,
      utilizationRate: vehicles.length > 0 ? Math.round((rented / vehicles.length) * 100) : 0
    };
  });

  // Selected vehicle computed signal
  selectedVehicle = computed(() => {
    const id = this.selectedVehicleId();
    return this.vehicles().find(v => v.id === id) || null;
  });

  // Total fleet value computed signal
  totalFleetValue = computed(() => {
    return this.vehicles().reduce((total, vehicle) => total + (vehicle.pricePerDay * 365), 0);
  });

  // Enums for template use
  VehicleCategory = VehicleCategory;
  TransmissionType = TransmissionType;
  FuelType = FuelType;
  VehicleStatus = VehicleStatus;

  // Effect for logging stats changes
  statsEffect = effect(() => {
    const stats = this.vehicleStats();
    console.log('Fleet stats updated:', stats);
  });

  ngOnInit(): void {
    this.loadMockData();
  }

  // Load mock data
  loadMockData(): void {
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: 'Silver',
        licensePlate: 'ABC-123',
        vin: '1HGBH41JXMN109186',
        category: VehicleCategory.MIDSIZE,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatingCapacity: 5,
        doors: 4,
        mileage: 15000,
        pricePerHour: 25,
        pricePerDay: 89,
        hasAC: true,
        hasGPS: true,
        hasBluetooth: true,
        hasWifi: false,
        hasUSB: true,
        hasSunroof: false,
        status: VehicleStatus.AVAILABLE,
        currentLocation: 'Downtown Branch',
        images: ['toyota-camry.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        make: 'BMW',
        model: 'X5',
        year: 2024,
        color: 'Black',
        licensePlate: 'XYZ-789',
        vin: '5UXWX7C59E0D12345',
        category: VehicleCategory.LUXURY,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seatingCapacity: 7,
        doors: 4,
        mileage: 8000,
        pricePerHour: 65,
        pricePerDay: 299,
        hasAC: true,
        hasGPS: true,
        hasBluetooth: true,
        hasWifi: true,
        hasUSB: true,
        hasSunroof: true,
        status: VehicleStatus.RENTED,
        currentLocation: 'Airport Branch',
        images: ['bmw-x5.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        color: 'Blue',
        licensePlate: 'DEF-456',
        category: VehicleCategory.COMPACT,
        transmission: TransmissionType.MANUAL,
        fuelType: FuelType.GASOLINE,
        seatingCapacity: 5,
        doors: 4,
        mileage: 25000,
        pricePerHour: 20,
        pricePerDay: 65,
        hasAC: true,
        hasGPS: false,
        hasBluetooth: true,
        hasWifi: false,
        hasUSB: true,
        hasSunroof: false,
        status: VehicleStatus.MAINTENANCE,
        currentLocation: 'Service Center',
        images: ['honda-civic.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        make: 'Tesla',
        model: 'Model 3',
        year: 2024,
        color: 'White',
        licensePlate: 'ELX-001',
        category: VehicleCategory.LUXURY,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.ELECTRIC,
        seatingCapacity: 5,
        doors: 4,
        mileage: 5000,
        pricePerHour: 45,
        pricePerDay: 199,
        hasAC: true,
        hasGPS: true,
        hasBluetooth: true,
        hasWifi: true,
        hasUSB: true,
        hasSunroof: true,
        status: VehicleStatus.AVAILABLE,
        currentLocation: 'City Center',
        images: ['tesla-model3.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.vehicles.set(mockVehicles);
  }

  // Methods
  toggleFilters(): void {
    this.showFilters.update(current => !current);
  }

  updateFilter(updates: Partial<FilterOptions>): void {
    this.filterSignal.update(current => ({ ...current, ...updates }));
  }

  clearFilters(): void {
    this.filterSignal.set({
      category: '',
      transmission: '',
      fuelType: '',
      status: '',
      availableOnly: false,
      priceRange: { min: 0, max: 1000 }
    });
    this.searchTerm.set('');
  }

  selectVehicle(vehicleId: string): void {
    this.selectedVehicleId.set(vehicleId);
  }

  updateVehicleStatus(vehicleId: string, status: VehicleStatus): void {
    this.vehicles.update(vehicles => 
      vehicles.map(vehicle => 
        vehicle.id === vehicleId ? { ...vehicle, status } : vehicle
      )
    );
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  getStatusColor(status: VehicleStatus): string {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case VehicleStatus.RENTED:
        return 'bg-blue-100 text-blue-800';
      case VehicleStatus.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      case VehicleStatus.OUT_OF_SERVICE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getCategoryIcon(category: VehicleCategory): string {
    switch (category) {
      case VehicleCategory.ECONOMY:
      case VehicleCategory.COMPACT:
        return '🚗';
      case VehicleCategory.MIDSIZE:
      case VehicleCategory.FULLSIZE:
        return '🚙';
      case VehicleCategory.LUXURY:
        return '🚘';
      case VehicleCategory.SUV:
        return '🚐';
      case VehicleCategory.TRUCK:
        return '🚚';
      case VehicleCategory.VAN:
        return '🚌';
      default:
        return '🚗';
    }
  }

  getFuelTypeIcon(fuelType: FuelType): string {
    switch (fuelType) {
      case FuelType.GASOLINE:
        return '⛽';
      case FuelType.DIESEL:
        return '🛢️';
      case FuelType.HYBRID:
        return '🔋';
      case FuelType.ELECTRIC:
        return '⚡';
      default:
        return '⛽';
    }
  }
}