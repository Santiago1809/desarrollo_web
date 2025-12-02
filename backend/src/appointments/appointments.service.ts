import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/entities/appointment.entity';
import { User } from 'src/entities/user.entity';
import { Service as ServiceEntity } from 'src/entities/service.entity';
import { Repository, In, DataSource } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CreateBarberScheduleDto } from './dto/create-barber-schedule.dto';
import { CreateBarberDateScheduleDto } from './dto/create-barber-date-schedule.dto';
import { AppointmentService as AppointmentServiceEntity } from 'src/entities/appointment-service.entity';
import { AppointmentParticipant } from 'src/entities/appointment-participant.entity';
import { TZDate } from '@date-fns/tz';
import {
  BarberScheduleService,
  AppointmentValidationService,
  BarberAvailabilityService,
  TimeUtils,
} from './services';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    private readonly dataSource: DataSource,
    private readonly barberScheduleService: BarberScheduleService,
    private readonly validationService: AppointmentValidationService,
    private readonly availabilityService: BarberAvailabilityService,
  ) {}

  // ==================== APPOINTMENT QUERIES ====================

  /**
   * Retrieves all appointments for a specific client
   */
  async getClientAppointments({ userId }: Readonly<{ userId: string }>) {
    return this.appointmentRepository.find({
      where: {
        participants: {
          role: 'client',
          user: { id: userId },
        },
      },
      relations: ['participants', 'services', 'ratings'],
    });
  }

  /**
   * Retrieves all appointments for a specific barber
   */
  async getBarberAppointments({ userId }: Readonly<{ userId: string }>) {
    return this.appointmentRepository.find({
      where: {
        participants: {
          role: 'barber',
          user: { id: userId },
        },
      },
      relations: ['participants', 'services', 'ratings'],
    });
  }

  /**
   * Retrieves all appointments in the system (admin only)
   */
  async getAllAppointments({ userId }: Readonly<{ userId: string }>) {
    const user = await this.userRepository.findOne({
      select: { role: true },
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role !== 3) {
      throw new BadRequestException('Access denied: insufficient permissions');
    }

    return this.appointmentRepository.find({
      relations: ['participants', 'services', 'ratings'],
    });
  }

  // ==================== APPOINTMENT CREATION ====================

  /**
   * Creates a new appointment with validation
   */
  async createAppointment({
    barberId,
    clientId,
    date,
    hour,
    serviceIds,
  }: CreateAppointmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const barberLockKey = TimeUtils.generateLockKey(barberId, date, hour);
      const clientLockKey = TimeUtils.generateLockKey(clientId, date, hour);

      await queryRunner.query(`SELECT pg_advisory_xact_lock($1)`, [
        barberLockKey,
      ]);
      await queryRunner.query(`SELECT pg_advisory_xact_lock($1)`, [
        clientLockKey,
      ]);

      const manager = queryRunner.manager;

      // Check for existing appointments at exact time
      const existingBarberAppointment =
        await this.validationService.checkExistingBarberAppointment(
          manager,
          barberId,
          date,
          hour,
        );

      if (existingBarberAppointment) {
        throw new BadRequestException(
          `Barber already has an appointment scheduled at ${hour} on this date`,
        );
      }

      const existingClientAppointment =
        await this.validationService.checkExistingClientAppointment(
          manager,
          clientId,
          date,
          hour,
        );

      if (existingClientAppointment) {
        throw new BadRequestException(
          `You already have an appointment scheduled at ${hour} on this date`,
        );
      }

      // Validate users exist
      const [barber, client] = await Promise.all([
        manager.findOne(User, { where: { id: barberId } }),
        manager.findOne(User, { where: { id: clientId } }),
      ]);

      if (!barber || !client) {
        throw new BadRequestException('Invalid barber or client ID');
      }

      // Validate services exist
      const services = await manager.find(ServiceEntity, {
        where: { id: In(serviceIds) },
      });

      if (services.length !== serviceIds.length) {
        throw new BadRequestException('One or more services not found');
      }

      const totalDuration = services.reduce(
        (sum, service) => sum + service.duration,
        0,
      );
      const totalPrice = services.reduce(
        (sum, service) => sum + Number(service.price),
        0,
      );

      const appointmentDate = TZDate.tz('America/Bogota', date);

      // Validate availability
      await this.validationService.validateBarberAvailabilityWithLock(
        manager,
        barberId,
        appointmentDate,
        hour,
        totalDuration,
      );

      await this.validationService.validateNoBarberConflictsWithLock(
        manager,
        barberId,
        appointmentDate,
        hour,
        totalDuration,
      );

      await this.validationService.validateClientAvailabilityWithLock(
        manager,
        clientId,
        appointmentDate,
        hour,
        totalDuration,
      );

      // Create appointment
      const appointment = await manager.save(Appointment, {
        date,
        hour,
        totalPrice,
      });

      // Save services and participants
      await Promise.all([
        ...serviceIds.map((serviceId) =>
          manager.save(AppointmentServiceEntity, {
            appointment,
            service: { id: serviceId },
          }),
        ),
        manager.save(AppointmentParticipant, {
          appointment,
          role: 'barber',
          user: { id: barberId },
        }),
        manager.save(AppointmentParticipant, {
          appointment,
          role: 'client',
          user: { id: clientId },
        }),
      ]);

      const savedAppointment = await manager.findOne(Appointment, {
        where: { id: appointment.id },
        relations: ['services', 'participants'],
      });

      await queryRunner.commitTransaction();
      return savedAppointment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== APPOINTMENT RESCHEDULING ====================

  /**
   * Reschedules an existing appointment
   */
  async rescheduleAppointment(
    userId: string,
    { appointmentId, newDate, newHour }: RescheduleAppointmentDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const appointment = await manager.findOne(Appointment, {
        where: { id: appointmentId },
        relations: [
          'participants',
          'participants.user',
          'services',
          'services.service',
        ],
      });

      if (!appointment) {
        throw new BadRequestException('Appointment not found');
      }

      if (appointment.state !== 'scheduled') {
        throw new BadRequestException(
          'Only scheduled appointments can be rescheduled',
        );
      }

      const isParticipant = appointment.participants.some(
        (p) => p.user.id === userId,
      );

      if (!isParticipant) {
        throw new BadRequestException(
          'You are not authorized to reschedule this appointment',
        );
      }

      const barberParticipant = appointment.participants.find(
        (p) => p.role === 'barber',
      );
      const clientParticipant = appointment.participants.find(
        (p) => p.role === 'client',
      );

      if (!barberParticipant || !clientParticipant) {
        throw new BadRequestException('Invalid appointment participants');
      }

      const barberId = barberParticipant.user.id;
      const clientId = clientParticipant.user.id;

      // Acquire locks
      const barberLockKey = TimeUtils.generateLockKey(
        barberId,
        newDate,
        newHour,
      );
      const clientLockKey = TimeUtils.generateLockKey(
        clientId,
        newDate,
        newHour,
      );

      await queryRunner.query(`SELECT pg_advisory_xact_lock($1)`, [
        barberLockKey,
      ]);
      await queryRunner.query(`SELECT pg_advisory_xact_lock($1)`, [
        clientLockKey,
      ]);

      // Check for existing appointments (excluding current)
      const existingBarberAppointment =
        await this.validationService.checkExistingBarberAppointment(
          manager,
          barberId,
          newDate,
          newHour,
          appointmentId,
        );

      if (existingBarberAppointment) {
        throw new BadRequestException(
          `Barber already has an appointment scheduled at ${newHour} on this date`,
        );
      }

      const existingClientAppointment =
        await this.validationService.checkExistingClientAppointment(
          manager,
          clientId,
          newDate,
          newHour,
          appointmentId,
        );

      if (existingClientAppointment) {
        throw new BadRequestException(
          `Client already has an appointment scheduled at ${newHour} on this date`,
        );
      }

      const totalDuration = appointment.services.reduce(
        (sum, as) => sum + (as.service?.duration || 0),
        0,
      );

      const appointmentDate = TZDate.tz('America/Bogota', newDate);

      // Validate availability
      await this.validationService.validateBarberAvailabilityWithLock(
        manager,
        barberId,
        appointmentDate,
        newHour,
        totalDuration,
      );

      await this.validationService.validateNoBarberConflictsWithLock(
        manager,
        barberId,
        appointmentDate,
        newHour,
        totalDuration,
        appointmentId,
      );

      await this.validationService.validateClientAvailabilityWithLock(
        manager,
        clientId,
        appointmentDate,
        newHour,
        totalDuration,
        appointmentId,
      );

      // Update appointment
      appointment.date = newDate;
      appointment.hour = newHour;
      appointment.state = 'reschedulled';

      await manager.save(Appointment, appointment);
      await queryRunner.commitTransaction();

      return manager.findOne(Appointment, {
        where: { id: appointmentId },
        relations: ['participants', 'services'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== BARBER SCHEDULE MANAGEMENT ====================
  // Delegated to BarberScheduleService

  async addBarberSchedule(barberId: string, schedule: CreateBarberScheduleDto) {
    return this.barberScheduleService.addBarberSchedule(barberId, schedule);
  }

  async getBarberSchedule(barberId: string) {
    return this.barberScheduleService.getBarberSchedule(barberId);
  }

  async deactivateBarberSchedule(scheduleId: string) {
    return this.barberScheduleService.deactivateBarberSchedule(scheduleId);
  }

  async setBarberDateSchedule(
    barberId: string,
    schedule: CreateBarberDateScheduleDto,
  ) {
    return this.barberScheduleService.setBarberDateSchedule(barberId, schedule);
  }

  async getBarberDateSchedules(barberId: string) {
    return this.barberScheduleService.getBarberDateSchedules(barberId);
  }

  async getBarberDateScheduleByDate(barberId: string, date: Date) {
    return this.barberScheduleService.getBarberDateScheduleByDate(
      barberId,
      date,
    );
  }

  async deleteBarberDateSchedule(scheduleId: string) {
    return this.barberScheduleService.deleteBarberDateSchedule(scheduleId);
  }

  // ==================== BARBER AVAILABILITY ====================
  // Delegated to BarberAvailabilityService

  async getBarberAvailability(
    barberId: string,
    startDate: Date,
    endDate: Date,
    slotDurationMinutes: number = 30,
  ) {
    return this.availabilityService.getBarberAvailability(
      barberId,
      startDate,
      endDate,
      slotDurationMinutes,
    );
  }
}
