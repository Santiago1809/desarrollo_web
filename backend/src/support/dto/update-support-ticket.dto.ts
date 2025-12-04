import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupportTicketDto {
  @ApiPropertyOptional({
    description: 'New state of the ticket',
    enum: ['open', 'in_progress', 'closed'],
    example: 'in_progress',
  })
  @IsEnum(['open', 'in_progress', 'closed'])
  @IsOptional()
  state?: 'open' | 'in_progress' | 'closed';

  @ApiPropertyOptional({
    description: 'Admin response to the ticket',
    example:
      'We have identified the issue and it has been resolved. Please try again.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminResponse?: string;
}
