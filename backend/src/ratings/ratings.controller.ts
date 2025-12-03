import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('ratings')
@UseGuards(AuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  createRating(@Req() request: CustomRequest, @Body() dto: CreateRatingDto) {
    const userId = request.user?.id;
    return this.ratingsService.createRating(userId!, dto);
  }

  @Get('barber/:barberId')
  getBarberRatings(@Param('barberId') barberId: string) {
    return this.ratingsService.getBarberRatings(barberId);
  }

  @Get('my-ratings')
  getMyRatings(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.ratingsService.getClientRatings(userId!);
  }

  @Get('check/:appointmentId')
  checkCanRate(
    @Req() request: CustomRequest,
    @Param('appointmentId') appointmentId: string,
  ) {
    const userId = request.user?.id;
    return this.ratingsService.canUserRateAppointment(userId!, appointmentId);
  }

  @Get('appointment/:appointmentId')
  getRatingByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.ratingsService.getRatingByAppointment(appointmentId);
  }

  @Patch(':ratingId')
  updateRating(
    @Req() request: CustomRequest,
    @Param('ratingId') ratingId: string,
    @Body() dto: Partial<CreateRatingDto>,
  ) {
    const userId = request.user?.id;
    return this.ratingsService.updateRating(userId!, ratingId, dto);
  }

  @Delete(':ratingId')
  deleteRating(
    @Req() request: CustomRequest,
    @Param('ratingId') ratingId: string,
  ) {
    const userId = request.user?.id;
    return this.ratingsService.deleteRating(userId!, ratingId);
  }
}
