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
  @IsUUID('4', { message: 'clientId must be a valid UUID v4' })
  clientId: string;

  @IsUUID('4', { message: 'barberId must be a valid UUID v4' })
  barberId: string;

  @IsDateString({}, { message: 'date must be a valid ISO 8601 date string' })
  date: string;

  @IsString({ message: 'hour must be a string' })
  @MinLength(1, { message: 'hour cannot be empty' })
  hour: string;

  @IsArray({ message: 'serviceIds must be an array' })
  @ArrayMinSize(1, { message: 'serviceIds must contain at least one service' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: 'each serviceId must be a number' })
  serviceIds: number[];
}
