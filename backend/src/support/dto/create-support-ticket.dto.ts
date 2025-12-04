import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({
    description: 'Detailed description of the issue or request',
    example:
      'I had an issue with my appointment booking. The system showed an error when trying to confirm.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @ApiPropertyOptional({
    description: 'Brief subject line for the ticket',
    example: 'Appointment booking error',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  subject?: string;
}
