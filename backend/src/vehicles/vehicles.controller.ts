// src/vehicles/vehicles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Vehicle, VehicleImage, MaintenanceRecord } from 'generated/prisma';
import { CreateMaintenanceRecordDto } from './dto/create-maintainance-record.dto';
import { CreateVehicleImageDto } from './dto/create-vehicle-image.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateMaintenanceRecordDto } from './dto/update-maintainance-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.vehiclesService.create(createVehicleDto);
    // Ensure licensePlate is a string (fallback to empty string if null)
    return {
      ...vehicle,
      licensePlate: vehicle.licensePlate ?? '',
    } as Vehicle;
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Vehicles retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: [
      'SEDAN',
      'SUV',
      'HATCHBACK',
      'COUPE',
      'CONVERTIBLE',
      'TRUCK',
      'VAN',
      'MOTORCYCLE',
    ],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE'],
  })
  @ApiQuery({
    name: 'fuelType',
    required: false,
    enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'],
  })
  @ApiQuery({
    name: 'transmission',
    required: false,
    enum: ['MANUAL', 'AUTOMATIC', 'CVT'],
  })
  async findAll(@Query() query: VehicleQueryDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available vehicles' })
  @ApiResponse({
    status: 200,
    description: 'Available vehicles retrieved successfully',
  })
  async getAvailableVehicles(@Query() query: VehicleQueryDto) {
    return this.vehiclesService.getAvailableVehicles(query);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get vehicles by category' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles by category retrieved successfully',
  })
  async getVehiclesByCategory(
    @Param('category') category: string,
    @Query() query: VehicleQueryDto,
  ) {
    return this.vehiclesService.getVehiclesByCategory(category, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesService.findOne(id);
    return {
      ...vehicle,
      licensePlate: vehicle.licensePlate ?? '',
    } as Vehicle;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.vehiclesService.update(id, updateVehicleDto);
    return {
      ...vehicle,
      licensePlate: vehicle.licensePlate ?? '',
    } as Vehicle;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.vehiclesService.remove(id);
  }

  // Vehicle Images endpoints
  @Post('images')
  @ApiOperation({ summary: 'Add an image to a vehicle' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async addImage(
    @Body() createImageDto: CreateVehicleImageDto,
  ): Promise<VehicleImage> {
    return this.vehiclesService.addImage(createImageDto);
  }

  @Delete('images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a vehicle image' })
  @ApiResponse({ status: 204, description: 'Image removed successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async removeImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.vehiclesService.removeImage(imageId);
  }

  @Patch('images/:imageId/primary')
  @ApiOperation({ summary: 'Set an image as primary' })
  @ApiResponse({ status: 200, description: 'Primary image set successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async setPrimaryImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<VehicleImage> {
    return this.vehiclesService.setPrimaryImage(imageId);
  }

  // Maintenance Records endpoints
  @Post('maintenance')
  @ApiOperation({ summary: 'Add a maintenance record' })
  @ApiResponse({
    status: 201,
    description: 'Maintenance record added successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async addMaintenanceRecord(
    @Body() createMaintenanceDto: CreateMaintenanceRecordDto,
  ): Promise<MaintenanceRecord> {
    return this.vehiclesService.addMaintenanceRecord(createMaintenanceDto);
  }

  @Get(':id/maintenance')
  @ApiOperation({ summary: 'Get maintenance records for a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance records retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async getMaintenanceRecords(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MaintenanceRecord[]> {
    return this.vehiclesService.getMaintenanceRecords(id);
  }

  @Patch('maintenance/:recordId')
  @ApiOperation({ summary: 'Update a maintenance record' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance record updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Maintenance record not found' })
  async updateMaintenanceRecord(
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceRecordDto,
  ): Promise<MaintenanceRecord> {
    return this.vehiclesService.updateMaintenanceRecord(
      recordId,
      updateMaintenanceDto,
    );
  }

  @Delete('maintenance/:recordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a maintenance record' })
  @ApiResponse({
    status: 204,
    description: 'Maintenance record deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Maintenance record not found' })
  async removeMaintenanceRecord(
    @Param('recordId', ParseUUIDPipe) recordId: string,
  ): Promise<void> {
    return this.vehiclesService.removeMaintenanceRecord(recordId);
  }
}
