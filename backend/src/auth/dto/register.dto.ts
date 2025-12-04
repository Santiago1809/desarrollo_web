import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumberString, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the account (8-20 characters)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @Length(8, 20)
  password: string;

  @ApiProperty({
    description: 'National identification number (DNI)',
    example: '12345678',
    minLength: 7,
    maxLength: 10,
  })
  @IsNumberString()
  @Length(7, 10)
  dni: string;
}
