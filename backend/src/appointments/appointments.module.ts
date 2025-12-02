import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/entities/appointment.entity';
import { AppointmentParticipant } from 'src/entities/appointment-participant.entity';
import { AppointmentRating } from 'src/entities/appointment-rating.entity';
import { AppointmentService } from 'src/entities/appointment-service.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { Service } from 'src/entities/service.entity';
import { BarberSchedule } from 'src/entities/barber-schedule.entity';
import { BarberDateSchedule } from 'src/entities/barber-date-schedule.entity';
import { BarberBreak } from 'src/entities/barber-break.entity';
import {
  BarberScheduleService,
  AppointmentValidationService,
  BarberAvailabilityService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentParticipant,
      AppointmentRating,
      AppointmentService,
      User,
      Service,
      BarberSchedule,
      BarberDateSchedule,
      BarberBreak,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    BarberScheduleService,
    AppointmentValidationService,
    BarberAvailabilityService,
  ],
})
export class AppointmentsModule {}
