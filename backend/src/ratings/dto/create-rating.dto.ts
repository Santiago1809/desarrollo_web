import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({
    description: 'UUID of the appointment being rated',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({
    description: 'Rating score from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional comment about the experience',
    example: 'Great haircut, very professional!',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
