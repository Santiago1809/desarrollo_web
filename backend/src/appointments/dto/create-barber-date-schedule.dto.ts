import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsBoolean,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class BarberBreakDto {
  @ApiProperty({
    description: 'Start time of the break in HH:mm format',
    example: '13:00',
  })
  @IsString({ message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({
    description: 'End time of the break in HH:mm format',
    example: '14:00',
  })
  @IsString({ message: 'endTime must be in HH:mm format' })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Reason for the break',
    example: 'Lunch break',
  })
  @IsString({ message: 'reason must be a string' })
  @IsOptional()
  reason?: string;
}

export class CreateBarberDateScheduleDto {
  @ApiProperty({
    description: 'Specific date for this schedule in ISO 8601 format',
    example: '2025-12-25',
    format: 'date',
  })
  @IsDateString({}, { message: 'date must be a valid ISO 8601 date string' })
  date: string;

  @ApiPropertyOptional({
    description: 'Whether the barber works on this specific date',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isWorkDay must be a boolean' })
  @IsOptional()
  isWorkDay?: boolean;

  @ApiPropertyOptional({
    description: 'Note for this date (e.g., "Holiday", "Birthday")',
    example: 'Christmas Day - Not working',
  })
  @IsString({ message: 'note must be a string' })
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({
    description: 'List of breaks for this specific date',
    type: [BarberBreakDto],
  })
  @IsArray({ message: 'breaks must be an array' })
  @ValidateNested({ each: true })
  @Type(() => BarberBreakDto)
  @IsOptional()
  breaks?: BarberBreakDto[];
}
