import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';

@Controller('appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  getAppointments(@Req() request: CustomRequest) {
    const userId = request.user?.id;
    return this.appointmentsService.getAppointments({ userId: userId! });
  }
}
