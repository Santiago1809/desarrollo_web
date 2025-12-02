import { IsEmail, IsNumberString, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20)
  password: string;

  @IsNumberString()
  @Length(7, 10)
  dni: string;
}
