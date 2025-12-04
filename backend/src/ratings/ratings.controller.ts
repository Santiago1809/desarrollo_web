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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@ApiTags('Ratings')
@ApiBearerAuth('JWT-auth')
@Controller('ratings')
@UseGuards(AuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rating for an appointment' })
  @ApiResponse({
    status: 201,
    description: 'Rating created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        rating: { type: 'number', example: 4.5 },
        comment: { type: 'string', example: 'Great service!' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Rating already exists for this appointment',
  })
  createRating(@Req() request: CustomRequest, @Body() dto: CreateRatingDto) {
    const userId = request.user?.id;
    return this.ratingsService.createRating(userId!, dto);
  }

  @Get('barber/:barberId')
  @ApiOperation({ summary: 'Get all ratings for a specific barber' })
  @ApiParam({
    name: 'barberId',
    description: 'UUID of the barber',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'List of barber ratings',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          rating: { type: 'number', example: 4.5 },
          comment: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          client: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  getBarberRatings(@Param('barberId') barberId: string) {
    return this.ratingsService.getBarberRatings(barberId);
  }

  @Get('my-ratings')
  @ApiOperation({ summary: 'Get all ratings made by the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'List of user ratings',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          rating: { type: 'number', example: 4.5 },
          comment: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          appointment: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              date: { type: 'string', format: 'date' },
            },
          },
        },
      },
    },
  })
  getMyRatings(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.ratingsService.getClientRatings(userId!);
  }

  @Get('check/:appointmentId')
  @ApiOperation({
    summary: 'Check if user can rate an appointment',
    description:
      'Returns whether the user is eligible to rate the specified appointment',
  })
  @ApiParam({
    name: 'appointmentId',
    description: 'UUID of the appointment',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Eligibility check result',
    schema: {
      type: 'object',
      properties: {
        canRate: { type: 'boolean' },
        reason: { type: 'string' },
      },
    },
  })
  checkCanRate(
    @Req() request: CustomRequest,
    @Param('appointmentId') appointmentId: string,
  ) {
    const userId = request.user?.id;
    return this.ratingsService.canUserRateAppointment(userId!, appointmentId);
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Get rating for a specific appointment' })
  @ApiParam({
    name: 'appointmentId',
    description: 'UUID of the appointment',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Rating details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        rating: { type: 'number', example: 4.5 },
        comment: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  getRatingByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.ratingsService.getRatingByAppointment(appointmentId);
  }

  @Patch(':ratingId')
  @ApiOperation({ summary: 'Update a rating' })
  @ApiParam({
    name: 'ratingId',
    description: 'UUID of the rating to update',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Rating updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        rating: { type: 'number', example: 5 },
        comment: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiResponse({
    status: 403,
    description: 'Not allowed to update this rating',
  })
  updateRating(
    @Req() request: CustomRequest,
    @Param('ratingId') ratingId: string,
    @Body() dto: Partial<CreateRatingDto>,
  ) {
    const userId = request.user?.id;
    return this.ratingsService.updateRating(userId!, ratingId, dto);
  }

  @Delete(':ratingId')
  @ApiOperation({ summary: 'Delete a rating' })
  @ApiParam({
    name: 'ratingId',
    description: 'UUID of the rating to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Rating deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Rating deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiResponse({
    status: 403,
    description: 'Not allowed to delete this rating',
  })
  deleteRating(
    @Req() request: CustomRequest,
    @Param('ratingId') ratingId: string,
  ) {
    const userId = request.user?.id;
    return this.ratingsService.deleteRating(userId!, ratingId);
  }
}
