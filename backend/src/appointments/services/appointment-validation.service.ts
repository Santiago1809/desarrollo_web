import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository, In, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/entities/appointment.entity';
import { BarberSchedule } from 'src/entities/barber-schedule.entity';
import { BarberDateSchedule } from 'src/entities/barber-date-schedule.entity';
import { BarberBreak } from 'src/entities/barber-break.entity';
import { TimeUtils } from './time.utils';
import { getDay, startOfDay } from 'date-fns';

@Injectable()
export class AppointmentValidationService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(BarberSchedule)
    private readonly barberScheduleRepository: Repository<BarberSchedule>,
    @InjectRepository(BarberDateSchedule)
    private readonly barberDateScheduleRepository: Repository<BarberDateSchedule>,
  ) {}

  /**
   * Validates barber availability within a transaction
   */
  async validateBarberAvailabilityWithLock(
    manager: EntityManager,
    barberId: string,
    date: Date,
    hour: string,
    durationHours: number,
  ): Promise<void> {
    const dayOfWeek = getDay(date);
    const checkDate = startOfDay(date);

    const dateSchedule = await manager.findOne(BarberDateSchedule, {
      where: {
        barber: { id: barberId },
        date: checkDate,
      },
      relations: ['breaks'],
    });

    if (dateSchedule) {
      if (!dateSchedule.isWorkDay) {
        throw new BadRequestException(
          `Barber is not available on ${dateSchedule.note || 'this date'}`,
        );
      }
      this.validateAgainstBreaks(hour, durationHours, dateSchedule.breaks);
      await this.validateNoBarberConflictsWithLock(
        manager,
        barberId,
        date,
        hour,
        durationHours,
      );
      return;
    }

    const schedule = await manager.findOne(BarberSchedule, {
      where: {
        barber: { id: barberId },
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      throw new BadRequestException(
        `Barber is not available on ${TimeUtils.getDayName(dayOfWeek)}`,
      );
    }

    this.validateTimeWithinSchedule(
      hour,
      durationHours,
      schedule.startTime,
      schedule.endTime,
    );

    await this.validateNoBarberConflictsWithLock(
      manager,
      barberId,
      date,
      hour,
      durationHours,
    );
  }

  /**
   * Validates barber has no conflicting appointments within a transaction
   */
  async validateNoBarberConflictsWithLock(
    manager: EntityManager,
    barberId: string,
    date: Date,
    hour: string,
    durationHours: number,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const appointmentStartTime = TimeUtils.timeToMinutes(hour);
    const appointmentEndTime = appointmentStartTime + durationHours * 60;

    let query = manager
      .createQueryBuilder(Appointment, 'appointment')
      .setLock('pessimistic_write')
      .innerJoin('appointment.participants', 'participant')
      .select('appointment.id')
      .where('appointment.date = :date', { date })
      .andWhere('participant.role = :role', { role: 'barber' })
      .andWhere('participant.userId = :barberId', { barberId })
      .andWhere('appointment.state IN (:...states)', {
        states: ['scheduled', 'reschedulled'],
      });

    if (excludeAppointmentId) {
      query = query.andWhere('appointment.id != :excludeId', {
        excludeId: excludeAppointmentId,
      });
    }

    const appointmentIds = await query.getRawMany();

    if (appointmentIds.length === 0) {
      return;
    }

    const ids = appointmentIds.map(
      (a: { appointment_id: string }) => a.appointment_id,
    );
    const conflictingAppointments = await manager.find(Appointment, {
      where: { id: In(ids) },
      relations: ['services', 'services.service'],
    });

    for (const existingAppointment of conflictingAppointments) {
      const existingStartTime = TimeUtils.timeToMinutes(
        existingAppointment.hour,
      );
      const existingDuration =
        this.calculateAppointmentDuration(existingAppointment);
      const existingEndTime = existingStartTime + existingDuration * 60;

      if (
        TimeUtils.hasTimeOverlap(
          appointmentStartTime,
          appointmentEndTime,
          existingStartTime,
          existingEndTime,
        )
      ) {
        throw new BadRequestException(
          `Barber has a conflicting appointment at ${existingAppointment.hour}`,
        );
      }
    }
  }

  /**
   * Validates client availability within a transaction
   */
  async validateClientAvailabilityWithLock(
    manager: EntityManager,
    clientId: string,
    date: Date,
    hour: string,
    durationHours: number,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const appointmentStartTime = TimeUtils.timeToMinutes(hour);
    const appointmentEndTime = appointmentStartTime + durationHours * 60;

    let query = manager
      .createQueryBuilder(Appointment, 'appointment')
      .setLock('pessimistic_write')
      .innerJoin('appointment.participants', 'participant')
      .select('appointment.id')
      .where('appointment.date = :date', { date })
      .andWhere('participant.role = :role', { role: 'client' })
      .andWhere('participant.userId = :clientId', { clientId })
      .andWhere('appointment.state IN (:...states)', {
        states: ['scheduled', 'reschedulled'],
      });

    if (excludeAppointmentId) {
      query = query.andWhere('appointment.id != :excludeId', {
        excludeId: excludeAppointmentId,
      });
    }

    const appointmentIds = await query.getRawMany();

    if (appointmentIds.length === 0) {
      return;
    }

    const ids = appointmentIds.map(
      (a: { appointment_id: string }) => a.appointment_id,
    );
    const clientAppointments = await manager.find(Appointment, {
      where: { id: In(ids) },
      relations: ['services', 'services.service'],
    });

    for (const existingAppointment of clientAppointments) {
      const existingStartTime = TimeUtils.timeToMinutes(
        existingAppointment.hour,
      );
      const existingDuration =
        this.calculateAppointmentDuration(existingAppointment);
      const existingEndTime = existingStartTime + existingDuration * 60;

      if (
        TimeUtils.hasTimeOverlap(
          appointmentStartTime,
          appointmentEndTime,
          existingStartTime,
          existingEndTime,
        )
      ) {
        throw new BadRequestException(
          `You already have an appointment at ${existingAppointment.hour} on this date. Please wait until ${TimeUtils.getEndTime(existingAppointment.hour, existingDuration)} to book another appointment`,
        );
      }
    }
  }

  /**
   * Checks if an appointment exists for a barber at exact date and hour
   */
  async checkExistingBarberAppointment(
    manager: EntityManager,
    barberId: string,
    date: Date | string,
    hour: string,
    excludeAppointmentId?: string,
  ): Promise<Appointment | null> {
    let query = manager
      .createQueryBuilder(Appointment, 'appointment')
      .innerJoin('appointment.participants', 'participant')
      .where('appointment.date = :date', { date })
      .andWhere('appointment.hour = :hour', { hour })
      .andWhere('participant.role = :role', { role: 'barber' })
      .andWhere('participant.userId = :barberId', { barberId })
      .andWhere('appointment.state = :state', { state: 'scheduled' });

    if (excludeAppointmentId) {
      query = query.andWhere('appointment.id != :excludeId', {
        excludeId: excludeAppointmentId,
      });
    }

    return query.getOne();
  }

  /**
   * Checks if an appointment exists for a client at exact date and hour
   */
  async checkExistingClientAppointment(
    manager: EntityManager,
    clientId: string,
    date: Date | string,
    hour: string,
    excludeAppointmentId?: string,
  ): Promise<Appointment | null> {
    let query = manager
      .createQueryBuilder(Appointment, 'appointment')
      .innerJoin('appointment.participants', 'participant')
      .where('appointment.date = :date', { date })
      .andWhere('appointment.hour = :hour', { hour })
      .andWhere('participant.role = :role', { role: 'client' })
      .andWhere('participant.userId = :clientId', { clientId })
      .andWhere('appointment.state = :state', { state: 'scheduled' });

    if (excludeAppointmentId) {
      query = query.andWhere('appointment.id != :excludeId', {
        excludeId: excludeAppointmentId,
      });
    }

    return query.getOne();
  }

  /**
   * Validates appointment time against breaks
   */
  validateAgainstBreaks(
    hour: string,
    durationHours: number,
    breaks?: BarberBreak[],
  ): void {
    if (!breaks || breaks.length === 0) {
      return;
    }

    const appointmentStartTime = TimeUtils.timeToMinutes(hour);
    const appointmentEndTime = appointmentStartTime + durationHours * 60;

    for (const breakPeriod of breaks) {
      const breakStartTime = TimeUtils.timeToMinutes(breakPeriod.startTime);
      const breakEndTime = TimeUtils.timeToMinutes(breakPeriod.endTime);

      if (
        TimeUtils.hasTimeOverlap(
          appointmentStartTime,
          appointmentEndTime,
          breakStartTime,
          breakEndTime,
        )
      ) {
        throw new BadRequestException(
          `Cannot schedule appointment during break: ${breakPeriod.startTime} - ${breakPeriod.endTime} (${breakPeriod.reason || 'break'})`,
        );
      }
    }
  }

  /**
   * Validates time is within schedule boundaries
   */
  validateTimeWithinSchedule(
    hour: string,
    durationHours: number,
    startTime: string,
    endTime: string,
  ): void {
    const appointmentStartTime = TimeUtils.timeToMinutes(hour);
    const appointmentEndTime = appointmentStartTime + durationHours * 60;
    const scheduleStartTime = TimeUtils.timeToMinutes(startTime);
    const scheduleEndTime = TimeUtils.timeToMinutes(endTime);

    if (
      appointmentStartTime < scheduleStartTime ||
      appointmentEndTime > scheduleEndTime
    ) {
      throw new BadRequestException(
        `Appointment time ${hour} is outside barber's working hours (${startTime} - ${endTime})`,
      );
    }
  }

  /**
   * Calculates total duration of an appointment in hours
   */
  private calculateAppointmentDuration(appointment: Appointment): number {
    return (appointment.services || []).reduce(
      (sum, appointmentService) =>
        sum + (appointmentService.service?.duration || 0),
      0,
    );
  }
}
