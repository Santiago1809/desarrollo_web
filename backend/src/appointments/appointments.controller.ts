import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Delete,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CreateBarberScheduleDto } from './dto/create-barber-schedule.dto';
import { CreateBarberDateScheduleDto } from './dto/create-barber-date-schedule.dto';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('client')
  @ApiOperation({ summary: 'Get all appointments for the logged-in client' })
  @ApiResponse({
    status: 200,
    description: 'List of client appointments',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
          },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', example: '10:00' },
          endTime: { type: 'string', example: '10:45' },
          totalDuration: { type: 'number', example: 45 },
          totalPrice: { type: 'number', example: 50 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getClientAppointments(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.appointmentsService.getClientAppointments({ userId: userId! });
  }

  @Get('barber')
  @ApiOperation({ summary: 'Get all appointments for the logged-in barber' })
  @ApiResponse({
    status: 200,
    description: 'List of barber appointments',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
          },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', example: '10:00' },
          endTime: { type: 'string', example: '10:45' },
          totalDuration: { type: 'number', example: 45 },
          totalPrice: { type: 'number', example: 50 },
          client: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getBarberAppointments(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.appointmentsService.getBarberAppointments({ userId: userId! });
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all appointments',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
          },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string', example: '10:00' },
          endTime: { type: 'string', example: '10:45' },
          totalDuration: { type: 'number', example: 45 },
          totalPrice: { type: 'number', example: 50 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  getAllAppointments(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.appointmentsService.getAllAppointments({ userId: userId! });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        status: { type: 'string', example: 'pending' },
        date: { type: 'string', format: 'date' },
        startTime: { type: 'string', example: '10:00' },
        endTime: { type: 'string', example: '10:45' },
        totalDuration: { type: 'number', example: 45 },
        totalPrice: { type: 'number', example: 50 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Time slot not available' })
  createAppoiment(@Body() data: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(data);
  }

  @Post('barber/schedule')
  @ApiOperation({ summary: 'Add a weekly schedule for the logged-in barber' })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        dayOfWeek: {
          type: 'number',
          example: 1,
          description: '0=Sunday, 1=Monday, ..., 6=Saturday',
        },
        startTime: { type: 'string', example: '09:00' },
        endTime: { type: 'string', example: '18:00' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addBarberSchedule(
    @Req() request: CustomRequest,
    @Body() data: CreateBarberScheduleDto,
  ) {
    const barberId = request.user?.id;
    return this.appointmentsService.addBarberSchedule(barberId!, data);
  }

  @Get('barber/schedule/:barberId')
  @ApiOperation({ summary: 'Get weekly schedule for a specific barber' })
  @ApiParam({
    name: 'barberId',
    description: 'UUID of the barber',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Barber schedule retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          dayOfWeek: { type: 'number', example: 1 },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '18:00' },
          isActive: { type: 'boolean' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  getBarberSchedule(@Param('barberId') barberId: string) {
    return this.appointmentsService.getBarberSchedule(barberId);
  }

  @Delete('barber/schedule/:scheduleId')
  @ApiOperation({ summary: 'Deactivate a barber schedule entry' })
  @ApiParam({
    name: 'scheduleId',
    description: 'UUID of the schedule to deactivate',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Schedule deactivated successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  deactivateBarberSchedule(@Param('scheduleId') scheduleId: string) {
    return this.appointmentsService.deactivateBarberSchedule(scheduleId);
  }

  @Post('barber/date-schedule')
  @ApiOperation({
    summary: 'Set a specific date schedule (override weekly schedule)',
  })
  @ApiResponse({
    status: 201,
    description: 'Date schedule created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        date: { type: 'string', format: 'date' },
        note: { type: 'string', example: 'Special schedule' },
        isWorkDay: { type: 'boolean' },
        breaks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              startTime: { type: 'string', example: '13:00' },
              endTime: { type: 'string', example: '14:00' },
              reason: { type: 'string', example: 'Lunch' },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  setBarberDateSchedule(
    @Req() request: CustomRequest,
    @Body() data: CreateBarberDateScheduleDto,
  ) {
    const barberId = request.user?.id;
    return this.appointmentsService.setBarberDateSchedule(barberId!, data);
  }

  @Get('barber/date-schedules/:barberId')
  @ApiOperation({ summary: 'Get all date-specific schedules for a barber' })
  @ApiParam({
    name: 'barberId',
    description: 'UUID of the barber',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Date schedules retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          date: { type: 'string', format: 'date' },
          note: { type: 'string' },
          isWorkDay: { type: 'boolean' },
          breaks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  getBarberDateSchedules(@Param('barberId') barberId: string) {
    return this.appointmentsService.getBarberDateSchedules(barberId);
  }

  @Delete('barber/date-schedule/:scheduleId')
  @ApiOperation({ summary: 'Delete a date-specific schedule' })
  @ApiParam({
    name: 'scheduleId',
    description: 'UUID of the date schedule to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Date schedule deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Date schedule deleted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  deleteBarberDateSchedule(@Param('scheduleId') scheduleId: string) {
    return this.appointmentsService.deleteBarberDateSchedule(scheduleId);
  }

  @Patch('reschedule')
  @ApiOperation({ summary: 'Reschedule an existing appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment rescheduled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        status: { type: 'string' },
        date: { type: 'string', format: 'date' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
        message: {
          type: 'string',
          example: 'Appointment rescheduled successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'New time slot not available' })
  rescheduleAppointment(
    @Req() request: CustomRequest,
    @Body() data: RescheduleAppointmentDto,
  ) {
    const userId = request.user?.id;
    return this.appointmentsService.rescheduleAppointment(userId!, data);
  }

  @Patch('cancel/:appointmentId')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({
    name: 'appointmentId',
    description: 'UUID of the appointment to cancel',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Appointment cancelled successfully',
        },
        id: { type: 'string', format: 'uuid' },
        status: { type: 'string', example: 'cancelled' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  cancelAppointment(
    @Req() request: CustomRequest,
    @Param('appointmentId') appointmentId: string,
  ) {
    const userId = request.user?.id;
    return this.appointmentsService.cancelAppointment(userId!, appointmentId);
  }

  @Patch('complete/:appointmentId')
  @ApiOperation({ summary: 'Mark an appointment as completed' })
  @ApiParam({
    name: 'appointmentId',
    description: 'UUID of the appointment to complete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment marked as completed',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Appointment completed successfully',
        },
        id: { type: 'string', format: 'uuid' },
        status: { type: 'string', example: 'completed' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  completeAppointment(
    @Req() request: CustomRequest,
    @Param('appointmentId') appointmentId: string,
  ) {
    const userId = request.user?.id;
    return this.appointmentsService.completeAppointment(userId!, appointmentId);
  }

  @Get('barber/availability/:barberId')
  @ApiOperation({
    summary: 'Get barber availability for a date range',
    description:
      'Returns available time slots for a barber within the specified date range',
  })
  @ApiParam({
    name: 'barberId',
    description: 'UUID of the barber',
    type: 'string',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date in ISO 8601 format',
    example: '2025-12-15',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date in ISO 8601 format',
    example: '2025-12-22',
    required: true,
  })
  @ApiQuery({
    name: 'slotDuration',
    description: 'Duration of each slot in minutes',
    example: '30',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Availability data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        barberId: { type: 'string', format: 'uuid' },
        availability: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date' },
              isWorkDay: { type: 'boolean' },
              slots: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    startTime: { type: 'string', example: '10:00' },
                    endTime: { type: 'string', example: '10:30' },
                    available: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  getBarberAvailability(
    @Param('barberId') barberId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('slotDuration') slotDuration?: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const slotDurationMinutes = slotDuration
      ? Number.parseInt(slotDuration, 10)
      : 30;

    return this.appointmentsService.getBarberAvailability(
      barberId,
      start,
      end,
      slotDurationMinutes,
    );
  }
}
