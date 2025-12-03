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
import {
  BarberScheduleService,
  AppointmentValidationService,
  BarberAvailabilityService,
  TimeUtils,
} from './services';
import { NotificationsService } from 'src/notifications/notifications.service';

/**
 * Parses a date string (YYYY-MM-DD) to a Date object at noon to avoid timezone issues
 */
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

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
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== APPOINTMENT QUERIES ====================

  /**
   * Retrieves all appointments for a specific client
   */
  async getClientAppointments({ userId }: Readonly<{ userId: string }>) {
    // Use QueryBuilder to properly load ALL participants, not just the filtered one
    const appointmentIds = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .innerJoin('appointment.participants', 'participant')
      .innerJoin('participant.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('appointment.date', 'ASC')
      .addOrderBy('appointment.hour', 'ASC')
      .select('appointment.id')
      .getMany();

    if (appointmentIds.length === 0) {
      return [];
    }

    return this.appointmentRepository.find({
      where: {
        id: In(appointmentIds.map((a) => a.id)),
      },
      relations: [
        'participants',
        'participants.user',
        'services',
        'services.service',
        'ratings',
      ],
    });
  }

  /**
   * Retrieves all appointments for a specific barber
   */
  async getBarberAppointments({ userId }: Readonly<{ userId: string }>) {
    // Use QueryBuilder to properly load ALL participants, not just the filtered one
    const appointmentIds = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .innerJoin('appointment.participants', 'participant')
      .innerJoin('participant.user', 'user')
      .where('participant.role = :role', { role: 'barber' })
      .andWhere('user.id = :userId', { userId })
      .select('appointment.id')
      .orderBy('appointment.date', 'ASC')
      .addOrderBy('appointment.hour', 'ASC')
      .getMany();

    if (appointmentIds.length === 0) {
      return [];
    }

    return this.appointmentRepository.find({
      where: {
        id: In(appointmentIds.map((a) => a.id)),
      },
      relations: [
        'participants',
        'participants.user',
        'services',
        'services.service',
        'ratings',
      ],
      order: { date: 'ASC', hour: 'ASC' },
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
      relations: [
        'participants',
        'participants.user',
        'services',
        'services.service',
        'ratings',
      ],
      order: { date: 'ASC', hour: 'ASC' },
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
        (sum, service) => sum + Number(service.duration),
        0,
      );
      const totalPrice = services.reduce(
        (sum, service) => sum + Number(service.price),
        0,
      );

      const appointmentDate = parseDateString(date);

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

      // Send notifications after successful commit
      if (savedAppointment) {
        this.sendAppointmentCreatedNotification(
          savedAppointment,
          barber,
          client,
          services.map((s) => s.name),
          date,
          hour,
        );
      }

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

      if (
        appointment.state !== 'scheduled' &&
        appointment.state !== 'reschedulled'
      ) {
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
        (sum, as) => sum + (Number(as.service?.duration) || 0),
        0,
      );

      const appointmentDate = parseDateString(newDate);

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

      // Store previous date and hour for notification
      const previousDate = this.formatDateForNotification(appointment.date);
      const previousHour = appointment.hour;

      // Update appointment
      appointment.date = parseDateString(newDate);
      appointment.hour = newHour;
      appointment.state = 'reschedulled';

      await manager.save(Appointment, appointment);

      // Fetch updated appointment BEFORE committing to use the same transaction
      const updatedAppointment = await manager.findOne(Appointment, {
        where: { id: appointmentId },
        relations: [
          'participants',
          'participants.user',
          'services',
          'services.service',
        ],
      });

      await queryRunner.commitTransaction();

      // Send notifications after successful commit
      if (updatedAppointment) {
        this.sendAppointmentRescheduledNotification({
          appointment: updatedAppointment,
          barber: barberParticipant.user,
          client: clientParticipant.user,
          services: appointment.services.map((s) => s.service?.name || ''),
          newDate,
          newHour,
          previousDate,
          previousHour,
        });
      }

      return updatedAppointment;
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

  // ==================== APPOINTMENT CANCELLATION ====================

  /**
   * Cancels an existing appointment
   */
  async cancelAppointment(userId: string, appointmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
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

    if (
      appointment.state !== 'scheduled' &&
      appointment.state !== 'reschedulled'
    ) {
      throw new BadRequestException(
        'Only scheduled appointments can be cancelled',
      );
    }

    const isParticipant = appointment.participants.some(
      (p) => p.user.id === userId,
    );

    if (!isParticipant) {
      throw new BadRequestException(
        'You are not authorized to cancel this appointment',
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

    // Update appointment state
    appointment.state = 'cancelled';
    await this.appointmentRepository.save(appointment);

    // Send notifications
    this.sendAppointmentCancelledNotification(
      appointment,
      barberParticipant.user,
      clientParticipant.user,
      appointment.services.map((s) => s.service?.name || ''),
      this.formatDateForNotification(appointment.date),
      appointment.hour,
    );

    return appointment;
  }

  // ==================== NOTIFICATION HELPERS ====================

  /**
   * Formats a date for notification display
   */
  private formatDateForNotification(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Sends notification for appointment creation (async, non-blocking)
   */
  private sendAppointmentCreatedNotification(
    appointment: Appointment,
    barber: User,
    client: User,
    services: string[],
    date: string,
    hour: string,
  ): void {
    // Fire and forget - don't block the response
    this.notificationsService
      .notifyAppointmentCreated({
        appointment,
        clientEmail: client.email,
        clientName: client.name,
        barberEmail: barber.email,
        barberName: barber.name,
        services,
        date,
        time: hour,
      })
      .catch((error) => {
        console.error(
          'Failed to send appointment created notification:',
          error,
        );
      });
  }

  /**
   * Sends notification for appointment rescheduling (async, non-blocking)
   */
  private sendAppointmentRescheduledNotification(params: {
    appointment: Appointment;
    barber: User;
    client: User;
    services: string[];
    newDate: string;
    newHour: string;
    previousDate: string;
    previousHour: string;
  }): void {
    const {
      appointment,
      barber,
      client,
      services,
      newDate,
      newHour,
      previousDate,
      previousHour,
    } = params;
    // Fire and forget - don't block the response
    this.notificationsService
      .notifyAppointmentRescheduled({
        appointment,
        clientEmail: client.email,
        clientName: client.name,
        barberEmail: barber.email,
        barberName: barber.name,
        services,
        date: newDate,
        time: newHour,
        previousDate,
        previousTime: previousHour,
      })
      .catch((error) => {
        console.error(
          'Failed to send appointment rescheduled notification:',
          error,
        );
      });
  }

  /**
   * Sends notification for appointment cancellation (async, non-blocking)
   */
  private sendAppointmentCancelledNotification(
    appointment: Appointment,
    barber: User,
    client: User,
    services: string[],
    date: string,
    hour: string,
  ): void {
    // Fire and forget - don't block the response
    this.notificationsService
      .notifyAppointmentCancelled({
        appointment,
        clientEmail: client.email,
        clientName: client.name,
        barberEmail: barber.email,
        barberName: barber.name,
        services,
        date,
        time: hour,
      })
      .catch((error) => {
        console.error(
          'Failed to send appointment cancelled notification:',
          error,
        );
      });
  }
}
