import { BadRequestException } from '@nestjs/common';

/**
 * Utility class for time-related operations
 */
export class TimeUtils {
  /**
   * Validates time format (HH:mm)
   */
  static validateTimeFormat(time: string): void {
    const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException('Time must be in HH:mm format (24-hour)');
    }
  }

  /**
   * Converts time string to minutes (handles HH:mm and HH:mm:ss formats)
   * Treats 00:00 as end of day (1440 minutes) when used as end time
   */
  static timeToMinutes(time: string, isEndTime: boolean = false): number {
    // Handle both HH:mm and HH:mm:ss formats
    const parts = time.split(':').map(Number);
    const hours = parts[0];
    const minutes = parts[1];
    const result = hours * 60 + minutes;

    // If it's an end time and equals 00:00, treat as 24:00 (end of day)
    if (isEndTime && result === 0) {
      return 1440; // 24 * 60
    }

    return result;
  }

  /**
   * Converts minutes to time string (HH:mm)
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Gets day name from day of week number
   */
  static getDayName(dayOfWeek: number): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayOfWeek];
  }

  /**
   * Calculates end time from start time and duration
   */
  static getEndTime(startTime: string, durationHours: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Generates a unique numeric lock key for advisory locks
   */
  static generateLockKey(
    id: string,
    date: Date | string,
    hour: string,
  ): number {
    const dateStr = date instanceof Date ? date.toISOString() : date;
    const combined = `${id}-${dateStr}-${hour}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.codePointAt(i) || 0;
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Checks if two time ranges overlap
   */
  static hasTimeOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }
}
