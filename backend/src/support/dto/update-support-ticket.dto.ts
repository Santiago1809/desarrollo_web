import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupportTicketDto {
  @IsEnum(['open', 'in_progress', 'closed'])
  @IsOptional()
  state?: 'open' | 'in_progress' | 'closed';

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminResponse?: string;
}
