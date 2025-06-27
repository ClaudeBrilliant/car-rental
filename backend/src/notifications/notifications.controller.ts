import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/notification.dto';
import { NotificationService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.service.findAllByUser(userId);
  }

  @Patch('read/:id')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Patch('read-all/:userId')
  markAllAsRead(@Param('userId') userId: string) {
    return this.service.markAllAsRead(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
