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
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CreateBarberScheduleDto } from './dto/create-barber-schedule.dto';
import { CreateBarberDateScheduleDto } from './dto/create-barber-date-schedule.dto';

@Controller('appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('client')
  getClientAppointments(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.appointmentsService.getClientAppointments({ userId: userId! });
  }

  @Get('barber')
  getBarberAppointments(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.appointmentsService.getBarberAppointments({ userId: userId! });
  }

  @Get()
  getAllAppointments(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.appointmentsService.getAllAppointments({ userId: userId! });
  }

  @Post()
  createAppoiment(@Body() data: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(data);
  }

  @Post('barber/schedule')
  addBarberSchedule(
    @Req() request: CustomRequest,
    @Body() data: CreateBarberScheduleDto,
  ) {
    const barberId = request.user?.id;
    return this.appointmentsService.addBarberSchedule(barberId!, data);
  }

  @Get('barber/schedule/:barberId')
  getBarberSchedule(@Param('barberId') barberId: string) {
    return this.appointmentsService.getBarberSchedule(barberId);
  }

  @Delete('barber/schedule/:scheduleId')
  deactivateBarberSchedule(@Param('scheduleId') scheduleId: string) {
    return this.appointmentsService.deactivateBarberSchedule(scheduleId);
  }

  @Post('barber/date-schedule')
  setBarberDateSchedule(
    @Req() request: CustomRequest,
    @Body() data: CreateBarberDateScheduleDto,
  ) {
    const barberId = request.user?.id;
    return this.appointmentsService.setBarberDateSchedule(barberId!, data);
  }

  @Get('barber/date-schedules/:barberId')
  getBarberDateSchedules(@Param('barberId') barberId: string) {
    return this.appointmentsService.getBarberDateSchedules(barberId);
  }

  @Delete('barber/date-schedule/:scheduleId')
  deleteBarberDateSchedule(@Param('scheduleId') scheduleId: string) {
    return this.appointmentsService.deleteBarberDateSchedule(scheduleId);
  }

  @Patch('reschedule')
  rescheduleAppointment(
    @Req() request: CustomRequest,
    @Body() data: RescheduleAppointmentDto,
  ) {
    const userId = request.user?.id;
    return this.appointmentsService.rescheduleAppointment(userId!, data);
  }

  @Patch('cancel/:appointmentId')
  cancelAppointment(
    @Req() request: CustomRequest,
    @Param('appointmentId') appointmentId: string,
  ) {
    const userId = request.user?.id;
    return this.appointmentsService.cancelAppointment(userId!, appointmentId);
  }

  @Get('barber/availability/:barberId')
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
