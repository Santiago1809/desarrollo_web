import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'UUID of the client booking the appointment',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'clientId must be a valid UUID v4' })
  clientId: string;

  @ApiProperty({
    description: 'UUID of the barber for the appointment',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'barberId must be a valid UUID v4' })
  barberId: string;

  @ApiProperty({
    description: 'Date of the appointment in ISO 8601 format',
    example: '2025-12-15',
    format: 'date',
  })
  @IsDateString({}, { message: 'date must be a valid ISO 8601 date string' })
  date: string;

  @ApiProperty({
    description: 'Time of the appointment in HH:mm format',
    example: '10:30',
  })
  @IsString({ message: 'hour must be a string' })
  @MinLength(1, { message: 'hour cannot be empty' })
  hour: string;

  @ApiProperty({
    description: 'Array of service IDs to include in the appointment',
    example: [1, 2, 3],
    type: [Number],
    minItems: 1,
  })
  @IsArray({ message: 'serviceIds must be an array' })
  @ArrayMinSize(1, { message: 'serviceIds must contain at least one service' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: 'each serviceId must be a number' })
  serviceIds: number[];
}
