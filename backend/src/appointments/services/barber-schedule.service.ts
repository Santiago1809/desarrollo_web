import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { BarberSchedule } from 'src/entities/barber-schedule.entity';
import { BarberDateSchedule } from 'src/entities/barber-date-schedule.entity';
import { BarberBreak } from 'src/entities/barber-break.entity';
import { CreateBarberScheduleDto } from '../dto/create-barber-schedule.dto';
import {
  CreateBarberDateScheduleDto,
  BarberBreakDto,
} from '../dto/create-barber-date-schedule.dto';
import { TimeUtils } from './time.utils';
import { isBefore, startOfDay } from 'date-fns';
import { TZDate } from '@date-fns/tz';

@Injectable()
export class BarberScheduleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BarberSchedule)
    private readonly barberScheduleRepository: Repository<BarberSchedule>,
    @InjectRepository(BarberDateSchedule)
    private readonly barberDateScheduleRepository: Repository<BarberDateSchedule>,
    @InjectRepository(BarberBreak)
    private readonly barberBreakRepository: Repository<BarberBreak>,
  ) {}

  /**
   * Adds or updates a schedule slot for a barber
   */
  async addBarberSchedule(barberId: string, schedule: CreateBarberScheduleDto) {
    const { dayOfWeek, startTime, endTime, isActive } = schedule;

    const barber = await this.userRepository.findOne({
      where: { id: barberId },
    });

    if (!barber) {
      throw new BadRequestException('Barber not found');
    }

    TimeUtils.validateTimeFormat(startTime);
    TimeUtils.validateTimeFormat(endTime);

    const startMinutes = TimeUtils.timeToMinutes(startTime);
    const endMinutes = TimeUtils.timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be before end time');
    }

    const existingSchedule = await this.barberScheduleRepository.findOne({
      where: {
        barber: { id: barberId },
        dayOfWeek,
      },
    });

    if (existingSchedule) {
      existingSchedule.startTime = startTime;
      existingSchedule.endTime = endTime;
      existingSchedule.isActive = isActive ?? true;
      return this.barberScheduleRepository.save(existingSchedule);
    }

    const barberSchedule = this.barberScheduleRepository.create({
      barber: { id: barberId },
      dayOfWeek,
      startTime,
      endTime,
      isActive: isActive ?? true,
    });

    return this.barberScheduleRepository.save(barberSchedule);
  }

  /**
   * Gets the weekly schedule for a specific barber
   */
  async getBarberSchedule(barberId: string) {
    const barber = await this.userRepository.findOne({
      where: { id: barberId },
    });

    if (!barber) {
      throw new BadRequestException('Barber not found');
    }

    return this.barberScheduleRepository.find({
      where: { barber: { id: barberId } },
      order: { dayOfWeek: 'ASC' },
    });
  }

  /**
   * Deactivates a barber's schedule slot
   */
  async deactivateBarberSchedule(scheduleId: string) {
    const schedule = await this.barberScheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    schedule.isActive = false;
    return this.barberScheduleRepository.save(schedule);
  }

  /**
   * Sets a custom schedule for a specific date
   */
  async setBarberDateSchedule(
    barberId: string,
    schedule: CreateBarberDateScheduleDto,
  ) {
    const barber = await this.userRepository.findOne({
      where: { id: barberId },
    });

    if (!barber) {
      throw new BadRequestException('Barber not found');
    }

    const scheduleDate = TZDate.tz('America/Bogota', schedule.date);
    const today = startOfDay(TZDate.tz('America/Bogota'));

    if (isBefore(scheduleDate, today)) {
      throw new BadRequestException('Cannot set schedule for past dates');
    }

    let dateSchedule = await this.barberDateScheduleRepository.findOne({
      where: {
        barber: { id: barberId },
        date: scheduleDate,
      },
      relations: ['breaks'],
    });

    if (dateSchedule) {
      dateSchedule.isWorkDay = schedule.isWorkDay ?? dateSchedule.isWorkDay;
      dateSchedule.note = schedule.note ?? dateSchedule.note;
    } else {
      dateSchedule = this.barberDateScheduleRepository.create({
        barber: { id: barberId },
        date: scheduleDate,
        isWorkDay: schedule.isWorkDay ?? true,
        note: schedule.note,
      });
    }

    await this.processDateScheduleBreaks(dateSchedule, schedule);

    return this.barberDateScheduleRepository.save(dateSchedule);
  }

  /**
   * Processes breaks for a date schedule
   */
  private async processDateScheduleBreaks(
    dateSchedule: BarberDateSchedule,
    schedule: CreateBarberDateScheduleDto,
  ): Promise<void> {
    if (!schedule.isWorkDay) {
      if (dateSchedule.breaks && dateSchedule.breaks.length > 0) {
        await this.barberBreakRepository.remove([...dateSchedule.breaks]);
      }
      dateSchedule.breaks = [];
      return;
    }

    if (schedule.breaks && schedule.breaks.length > 0) {
      const breaks = this.createBreaksFromDTO(schedule.breaks, dateSchedule);

      if (dateSchedule.breaks && dateSchedule.breaks.length > 0) {
        await this.barberBreakRepository.remove([...dateSchedule.breaks]);
      }

      dateSchedule.breaks = await this.barberBreakRepository.save(breaks);
    }
  }

  /**
   * Creates break entities from DTOs
   */
  private createBreaksFromDTO(
    breakDTOs: BarberBreakDto[],
    dateSchedule: BarberDateSchedule,
  ): BarberBreak[] {
    const breaks: BarberBreak[] = [];

    for (const breakData of breakDTOs) {
      TimeUtils.validateTimeFormat(breakData.startTime);
      TimeUtils.validateTimeFormat(breakData.endTime);

      const startMinutes = TimeUtils.timeToMinutes(breakData.startTime);
      const endMinutes = TimeUtils.timeToMinutes(breakData.endTime);

      if (startMinutes >= endMinutes) {
        throw new BadRequestException(
          `Break start time must be before end time: ${breakData.startTime} - ${breakData.endTime}`,
        );
      }

      const barberBreak = this.barberBreakRepository.create({
        dateSchedule,
        startTime: breakData.startTime,
        endTime: breakData.endTime,
        reason: breakData.reason,
      });

      breaks.push(barberBreak);
    }

    return breaks;
  }

  /**
   * Gets all custom schedules for a barber
   */
  async getBarberDateSchedules(barberId: string) {
    const barber = await this.userRepository.findOne({
      where: { id: barberId },
    });

    if (!barber) {
      throw new BadRequestException('Barber not found');
    }

    return this.barberDateScheduleRepository.find({
      where: { barber: { id: barberId } },
      relations: ['breaks'],
      order: { date: 'ASC' },
    });
  }

  /**
   * Gets date schedule for a specific date
   */
  async getBarberDateScheduleByDate(barberId: string, date: Date) {
    const checkDate = startOfDay(date);

    return this.barberDateScheduleRepository.findOne({
      where: {
        barber: { id: barberId },
        date: checkDate,
      },
      relations: ['breaks'],
    });
  }

  /**
   * Deletes a custom date schedule
   */
  async deleteBarberDateSchedule(scheduleId: string) {
    const schedule = await this.barberDateScheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['breaks'],
    });

    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    if (schedule.breaks && schedule.breaks.length > 0) {
      await this.barberBreakRepository.remove([...schedule.breaks]);
    }

    return this.barberDateScheduleRepository.remove(schedule);
  }

  /**
   * Gets active weekly schedules for a barber
   */
  async getActiveWeeklySchedules(barberId: string) {
    return this.barberScheduleRepository.find({
      where: { barber: { id: barberId }, isActive: true },
    });
  }

  /**
   * Gets all date schedules for a barber
   */
  async getAllDateSchedules(barberId: string) {
    return this.barberDateScheduleRepository.find({
      where: { barber: { id: barberId } },
      relations: ['breaks'],
    });
  }
}
