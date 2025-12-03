import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findBarbers(): Promise<Partial<User>[]> {
    const barbers = await this.userRepository.find({
      where: { role: 2 },
      select: ['id', 'name', 'email'],
    });
    return barbers;
  }
}
