import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationService } from './locations.service';
import { UpdateLocationDto } from './dto/update-location';

@Controller('locations')
export class LocationController {
  constructor(private readonly service: LocationService) {}

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
