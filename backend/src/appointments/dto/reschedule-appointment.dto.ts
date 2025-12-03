import { IsDateString, IsString, IsUUID, MinLength } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsUUID('4', { message: 'appointmentId must be a valid UUID v4' })
  appointmentId: string;

  @IsDateString({}, { message: 'newDate must be a valid ISO 8601 date string' })
  newDate: string;

  @IsString({ message: 'newHour must be a string' })
  @MinLength(1, { message: 'newHour cannot be empty' })
  newHour: string;
}
