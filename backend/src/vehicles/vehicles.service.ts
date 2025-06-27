/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/vehicles/vehicles.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  MaintenanceRecord,
  Prisma,
  Vehicle,
  VehicleImage,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaintenanceRecordDto } from './dto/create-maintainance-record.dto';
import { CreateVehicleImageDto } from './dto/create-vehicle-image.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateMaintenanceRecordDto } from './dto/update-maintainance-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const {
      lastServiceDate,
      nextServiceDate,
      insuranceExpiry,
      ...vehicleData
    } = createVehicleDto;

    // Check if license plate already exists
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { licensePlate: createVehicleDto.licensePlate },
    });

    if (existingVehicle) {
      throw new BadRequestException(
        'Vehicle with this license plate already exists',
      );
    }

    // Check if VIN already exists (if provided)
    if (createVehicleDto.vin) {
      const existingVin = await this.prisma.vehicle.findUnique({
        where: { vin: createVehicleDto.vin },
      });

      if (existingVin) {
        throw new BadRequestException('Vehicle with this VIN already exists');
      }
    }

    return this.prisma.vehicle.create({
      data: {
        ...vehicleData,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
        nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      },
    });
  }

  async findAll(query: VehicleQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      ...filters
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {
      ...filters,
      ...(search && {
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { licensePlate: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            OR: [
              {
                pricePerHour: {
                  ...(minPrice !== undefined && { gte: minPrice }),
                  ...(maxPrice !== undefined && { lte: maxPrice }),
                },
              },
              {
                pricePerDay: {
                  ...(minPrice !== undefined && { gte: minPrice }),
                  ...(maxPrice !== undefined && { lte: maxPrice }),
                },
              },
            ],
          }
        : {}),
    };

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: true,
        maintenanceRecords: {
          orderBy: { serviceDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    const { lastServiceDate, nextServiceDate, insuranceExpiry, ...updateData } =
      updateVehicleDto;

    // Check license plate uniqueness if being updated
    if (
      updateVehicleDto.licensePlate &&
      updateVehicleDto.licensePlate !== vehicle.licensePlate
    ) {
      const existingVehicle = await this.prisma.vehicle.findUnique({
        where: { licensePlate: updateVehicleDto.licensePlate },
      });

      if (existingVehicle) {
        throw new BadRequestException(
          'Vehicle with this license plate already exists',
        );
      }
    }

    // Check VIN uniqueness if being updated
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const existingVin = await this.prisma.vehicle.findUnique({
        where: { vin: updateVehicleDto.vin },
      });

      if (existingVin) {
        throw new BadRequestException('Vehicle with this VIN already exists');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...updateData,
        ...(lastServiceDate && { lastServiceDate: new Date(lastServiceDate) }),
        ...(nextServiceDate && { nextServiceDate: new Date(nextServiceDate) }),
        ...(insuranceExpiry && { insuranceExpiry: new Date(insuranceExpiry) }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.vehicle.delete({
      where: { id },
    });
  }

  // Vehicle Images
  async addImage(createImageDto: CreateVehicleImageDto): Promise<VehicleImage> {
    await this.findOne(createImageDto.vehicleId); // Verify vehicle exists

    // If this is set as primary, unset other primary images
    if (createImageDto.isPrimary) {
      await this.prisma.vehicleImage.updateMany({
        where: { vehicleId: createImageDto.vehicleId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.vehicleImage.create({
      data: createImageDto,
    });
  }

  async removeImage(imageId: string): Promise<void> {
    const image = await this.prisma.vehicleImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    await this.prisma.vehicleImage.delete({
      where: { id: imageId },
    });
  }

  async setPrimaryImage(imageId: string): Promise<VehicleImage> {
    const image = await this.prisma.vehicleImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    // Unset other primary images for this vehicle
    await this.prisma.vehicleImage.updateMany({
      where: { vehicleId: image.vehicleId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this image as primary
    return this.prisma.vehicleImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  // Maintenance Records
  async addMaintenanceRecord(
    createMaintenanceDto: CreateMaintenanceRecordDto,
  ): Promise<MaintenanceRecord> {
    await this.findOne(createMaintenanceDto.vehicleId); // Verify vehicle exists

    const { serviceDate, nextService, ...maintenanceData } =
      createMaintenanceDto;

    const maintenanceRecord = await this.prisma.maintenanceRecord.create({
      data: {
        ...maintenanceData,
        serviceDate: new Date(serviceDate),
        nextService: nextService ? new Date(nextService) : null,
      },
    });

    // Update vehicle's last service date
    await this.prisma.vehicle.update({
      where: { id: createMaintenanceDto.vehicleId },
      data: {
        lastServiceDate: new Date(serviceDate),
        nextServiceDate: nextService ? new Date(nextService) : null,
      },
    });

    return maintenanceRecord;
  }

  async getMaintenanceRecords(vehicleId: string): Promise<MaintenanceRecord[]> {
    await this.findOne(vehicleId); // Verify vehicle exists

    return this.prisma.maintenanceRecord.findMany({
      where: { vehicleId },
      orderBy: { serviceDate: 'desc' },
    });
  }

  async updateMaintenanceRecord(
    id: string,
    updateMaintenanceDto: UpdateMaintenanceRecordDto,
  ): Promise<MaintenanceRecord> {
    const record = await this.prisma.maintenanceRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }

    const { serviceDate, nextService, ...updateData } = updateMaintenanceDto;

    return this.prisma.maintenanceRecord.update({
      where: { id },
      data: {
        ...updateData,
        ...(serviceDate && { serviceDate: new Date(serviceDate) }),
        ...(nextService && { nextService: new Date(nextService) }),
      },
    });
  }

  async removeMaintenanceRecord(id: string): Promise<void> {
    const record = await this.prisma.maintenanceRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }

    await this.prisma.maintenanceRecord.delete({
      where: { id },
    });
  }

  // Utility methods
  async getAvailableVehicles(query: VehicleQueryDto) {
    return this.findAll({
      ...query,
      status: 'AVAILABLE',
    });
  }

  async getVehiclesByCategory(category: string, query: VehicleQueryDto) {
    return this.findAll({
      ...query,
      category: category as any,
    });
  }
}
