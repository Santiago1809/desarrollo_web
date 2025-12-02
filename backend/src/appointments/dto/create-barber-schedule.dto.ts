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
  @IsNumber({}, { message: 'dayOfWeek must be a number' })
  @Min(0, { message: 'dayOfWeek must be between 0 and 6' })
  @Max(6, { message: 'dayOfWeek must be between 0 and 6' })
  dayOfWeek: number;

  @IsString({ message: 'startTime must be a string in HH:mm format' })
  @Matches(/^([01]?\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format (24-hour)',
  })
  startTime: string;

  @IsString({ message: 'endTime must be a string in HH:mm format' })
  @Matches(/^([01]?\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format (24-hour)',
  })
  endTime: string;

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
