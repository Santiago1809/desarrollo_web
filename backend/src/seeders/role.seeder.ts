import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleSeeder implements OnModuleInit {
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const count = await this.roleRepository.count();

    if (count > 0) {
      this.logger.log('Roles already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding roles...');

    const roles = [
      { id: '1', name: 'CLIENTE' },
      { id: '2', name: 'BARBERO' },
      { id: '3', name: 'ADMINISTRADOR' },
    ];

    for (const roleData of roles) {
      const role = this.roleRepository.create({
        name: roleData.name,
        id: roleData.id,
      });
      await this.roleRepository.save(role);
      this.logger.log(`Created role: ${roleData.name} (ID: ${roleData.id})`);
    }

    this.logger.log('Roles seeding completed!');
  }
}
