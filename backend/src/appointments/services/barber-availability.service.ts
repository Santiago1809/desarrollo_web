import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from 'src/entities/appointment.entity';
import { User } from 'src/entities/user.entity';
import { BarberScheduleService } from './barber-schedule.service';
import { TimeUtils } from './time.utils';
import { getDay } from 'date-fns';

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  dayName: string;
  isWorkDay: boolean;
  workingHours: { start: string; end: string } | null;
  breaks: { start: string; end: string; reason?: string }[];
  slots: AvailabilitySlot[];
}

export interface BarberAvailabilityResponse {
  barberId: string;
  barberName: string;
  slotDurationMinutes: number;
  availability: DayAvailability[];
}

@Injectable()
export class BarberAvailabilityService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly barberScheduleService: BarberScheduleService,
  ) {}

  /**
   * Gets barber availability for a date range
   */
  async getBarberAvailability(
    barberId: string,
    startDate: Date,
    endDate: Date,
    slotDurationMinutes: number = 30,
  ): Promise<BarberAvailabilityResponse> {
    const barber = await this.userRepository.findOne({
      where: { id: barberId },
    });

    if (!barber) {
      throw new BadRequestException('Barber not found');
    }

    const weeklySchedules =
      await this.barberScheduleService.getActiveWeeklySchedules(barberId);
    const dateSchedules =
      await this.barberScheduleService.getAllDateSchedules(barberId);
    const appointments = await this.getAppointmentsInRange(
      barberId,
      startDate,
      endDate,
    );

    const appointmentsByDate = this.groupAppointmentsByDate(appointments);
    const availability = this.buildAvailability(
      startDate,
      endDate,
      weeklySchedules,
      dateSchedules,
      appointmentsByDate,
      slotDurationMinutes,
    );

    return {
      barberId,
      barberName: barber.name,
      slotDurationMinutes,
      availability,
    };
  }

  /**
   * Gets appointments for a barber in a date range
   */
  private async getAppointmentsInRange(
    barberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .innerJoin('appointment.participants', 'participant')
      .leftJoinAndSelect('appointment.services', 'appointmentService')
      .leftJoinAndSelect('appointmentService.service', 'service')
      .where('appointment.date >= :startDate', { startDate })
      .andWhere('appointment.date <= :endDate', { endDate })
      .andWhere('participant.role = :role', { role: 'barber' })
      .andWhere('participant.userId = :barberId', { barberId })
      .andWhere('appointment.state IN (:...states)', {
        states: ['scheduled', 'reschedulled'],
      })
      .getMany();
  }

  /**
   * Groups appointments by date key
   */
  private groupAppointmentsByDate(
    appointments: Appointment[],
  ): Map<string, Appointment[]> {
    const appointmentsByDate = new Map<string, Appointment[]>();

    for (const apt of appointments) {
      const dateKey = new Date(apt.date).toISOString().split('T')[0];
      if (!appointmentsByDate.has(dateKey)) {
        appointmentsByDate.set(dateKey, []);
      }
      appointmentsByDate.get(dateKey)!.push(apt);
    }

    return appointmentsByDate;
  }

  /**
   * Builds the availability array for each day in the range
   */
  private buildAvailability(
    startDate: Date,
    endDate: Date,
    weeklySchedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[],
    dateSchedules: {
      date: Date;
      isWorkDay: boolean;
      breaks?: { startTime: string; endTime: string; reason?: string }[];
    }[],
    appointmentsByDate: Map<string, Appointment[]>,
    slotDurationMinutes: number,
  ): DayAvailability[] {
    const availability: DayAvailability[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dayAvailability = this.buildDayAvailability(
        currentDate,
        weeklySchedules,
        dateSchedules,
        appointmentsByDate,
        slotDurationMinutes,
      );
      availability.push(dayAvailability);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availability;
  }

  /**
   * Builds availability for a single day
   */
  private buildDayAvailability(
    date: Date,
    weeklySchedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[],
    dateSchedules: {
      date: Date;
      isWorkDay: boolean;
      breaks?: { startTime: string; endTime: string; reason?: string }[];
    }[],
    appointmentsByDate: Map<string, Appointment[]>,
    slotDurationMinutes: number,
  ): DayAvailability {
    const dateKey = date.toISOString().split('T')[0];
    const dayOfWeek = getDay(date);

    const { isWorkDay, workingHours, breaks } = this.getDayScheduleInfo(
      dateKey,
      dayOfWeek,
      weeklySchedules,
      dateSchedules,
    );

    const slots = this.generateSlots(
      isWorkDay,
      workingHours,
      breaks,
      appointmentsByDate.get(dateKey) || [],
      slotDurationMinutes,
    );

    return {
      date: dateKey,
      dayOfWeek,
      dayName: TimeUtils.getDayName(dayOfWeek),
      isWorkDay,
      workingHours,
      breaks,
      slots,
    };
  }

  /**
   * Gets schedule info for a specific day
   */
  private getDayScheduleInfo(
    dateKey: string,
    dayOfWeek: number,
    weeklySchedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[],
    dateSchedules: {
      date: Date;
      isWorkDay: boolean;
      breaks?: { startTime: string; endTime: string; reason?: string }[];
    }[],
  ): {
    isWorkDay: boolean;
    workingHours: { start: string; end: string } | null;
    breaks: { start: string; end: string; reason?: string }[];
  } {
    const dateSchedule = dateSchedules.find((ds) => {
      const dsDate = new Date(ds.date).toISOString().split('T')[0];
      return dsDate === dateKey;
    });

    if (dateSchedule) {
      if (!dateSchedule.isWorkDay) {
        return { isWorkDay: false, workingHours: null, breaks: [] };
      }

      const weeklySchedule = weeklySchedules.find(
        (ws) => ws.dayOfWeek === dayOfWeek,
      );

      return {
        isWorkDay: true,
        workingHours: weeklySchedule
          ? { start: weeklySchedule.startTime, end: weeklySchedule.endTime }
          : null,
        breaks: (dateSchedule.breaks || []).map((b) => ({
          start: b.startTime,
          end: b.endTime,
          reason: b.reason,
        })),
      };
    }

    const weeklySchedule = weeklySchedules.find(
      (ws) => ws.dayOfWeek === dayOfWeek,
    );

    if (weeklySchedule) {
      return {
        isWorkDay: true,
        workingHours: {
          start: weeklySchedule.startTime,
          end: weeklySchedule.endTime,
        },
        breaks: [],
      };
    }

    return { isWorkDay: false, workingHours: null, breaks: [] };
  }

  /**
   * Generates time slots for a day
   */
  private generateSlots(
    isWorkDay: boolean,
    workingHours: { start: string; end: string } | null,
    breaks: { start: string; end: string; reason?: string }[],
    dayAppointments: Appointment[],
    slotDurationMinutes: number,
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];

    if (!isWorkDay || !workingHours) {
      return slots;
    }

    const startMinutes = TimeUtils.timeToMinutes(workingHours.start);
    const endMinutes = TimeUtils.timeToMinutes(workingHours.end);

    for (
      let minutes = startMinutes;
      minutes < endMinutes;
      minutes += slotDurationMinutes
    ) {
      const slot = this.evaluateSlot(minutes, breaks, dayAppointments);
      slots.push(slot);
    }

    return slots;
  }

  /**
   * Evaluates a single time slot
   */
  private evaluateSlot(
    minutes: number,
    breaks: { start: string; end: string; reason?: string }[],
    dayAppointments: Appointment[],
  ): AvailabilitySlot {
    const slotTime = TimeUtils.minutesToTime(minutes);
    let available = true;
    let appointmentId: string | undefined;

    // Check if slot is during a break
    for (const breakPeriod of breaks) {
      const breakStart = TimeUtils.timeToMinutes(breakPeriod.start);
      const breakEnd = TimeUtils.timeToMinutes(breakPeriod.end);
      if (minutes >= breakStart && minutes < breakEnd) {
        available = false;
        break;
      }
    }

    // Check if slot overlaps with an appointment
    if (available) {
      for (const apt of dayAppointments) {
        const aptStart = TimeUtils.timeToMinutes(apt.hour);
        const aptDuration = this.calculateAppointmentDurationMinutes(apt);
        const aptEnd = aptStart + aptDuration;

        if (minutes >= aptStart && minutes < aptEnd) {
          available = false;
          appointmentId = apt.id;
          break;
        }
      }
    }

    return {
      time: slotTime,
      available,
      ...(appointmentId && { appointmentId }),
    };
  }

  /**
   * Calculates appointment duration in minutes
   */
  private calculateAppointmentDurationMinutes(
    appointment: Appointment,
  ): number {
    return (appointment.services || []).reduce(
      (sum, as) => sum + (as.service?.duration || 0) * 60,
      0,
    );
  }
}
