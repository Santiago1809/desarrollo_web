import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUUID, MinLength } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'UUID of the appointment to reschedule',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'appointmentId must be a valid UUID v4' })
  appointmentId: string;

  @ApiProperty({
    description: 'New date for the appointment in ISO 8601 format',
    example: '2025-12-20',
    format: 'date',
  })
  @IsDateString({}, { message: 'newDate must be a valid ISO 8601 date string' })
  newDate: string;

  @ApiProperty({
    description: 'New time for the appointment in HH:mm format',
    example: '14:30',
  })
  @IsString({ message: 'newHour must be a string' })
  @MinLength(1, { message: 'newHour cannot be empty' })
  newHour: string;
}
