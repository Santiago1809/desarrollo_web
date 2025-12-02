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
  @IsString({ message: 'startTime must be in HH:mm format' })
  startTime: string;

  @IsString({ message: 'endTime must be in HH:mm format' })
  endTime: string;

  @IsString({ message: 'reason must be a string' })
  @IsOptional()
  reason?: string;
}

export class CreateBarberDateScheduleDto {
  @IsDateString({}, { message: 'date must be a valid ISO 8601 date string' })
  date: Date;

  @IsBoolean({ message: 'isWorkDay must be a boolean' })
  @IsOptional()
  isWorkDay?: boolean;

  @IsString({ message: 'note must be a string' })
  @IsOptional()
  note?: string;

  @IsArray({ message: 'breaks must be an array' })
  @ValidateNested({ each: true })
  @Type(() => BarberBreakDto)
  @IsOptional()
  breaks?: BarberBreakDto[];
}
