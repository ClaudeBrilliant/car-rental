import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { CreateReviewDto, RespondToReviewDto } from './dto/review.dto';
import { ReviewService } from './reviews.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Patch('respond')
  respond(@Body() dto: RespondToReviewDto) {
    return this.service.respondToReview(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
