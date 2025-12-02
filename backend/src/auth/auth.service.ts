import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptService } from 'src/utils/bcrypt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: BcryptService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async registerUser(data: RegisterDto) {
    const hashedPassword = await this.bcryptService.hashPassword(data.password);
    const newUser = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      dni: data.dni,
    });
    const savedUser = await this.userRepository.save(newUser);
    const accessToken = this.jwtService.sign({
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
    });
    return {
      ...savedUser,
      password: undefined,
      accessToken,
    };
  }

  async login(data: LoginDto) {
    const user = await this.findUserByEmail(data.email);
    if (!user) {
      return 'User not found';
    }
    const isPasswordValid = await this.bcryptService.comparePassword(
      data.password,
      user.password,
    );
    if (!isPasswordValid) {
      return 'Invalid password';
    }
    const accessToken = this.jwtService.sign({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    return {
      ...user,
      password: undefined,
      accessToken,
    };
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
