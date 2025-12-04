import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateBarberScheduleDto {
  @ApiProperty({
    description: 'Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsNumber({}, { message: 'dayOfWeek must be a number' })
  @Min(0, { message: 'dayOfWeek must be between 0 and 6' })
  @Max(6, { message: 'dayOfWeek must be between 0 and 6' })
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time of the work day in HH:mm format (24-hour)',
    example: '09:00',
  })
  @IsString({ message: 'startTime must be a string in HH:mm format' })
  @Matches(/^([01]?\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format (24-hour)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the work day in HH:mm format (24-hour)',
    example: '18:00',
  })
  @IsString({ message: 'endTime must be a string in HH:mm format' })
  @Matches(/^([01]?\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format (24-hour)',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Whether this schedule is active',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
