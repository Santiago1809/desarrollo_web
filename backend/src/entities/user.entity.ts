import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Role } from './role.entity';
import type { Support } from './support.entity';
import type { AppointmentParticipant } from './appointment-participant.entity';
import type { AppointmentRating } from './appointment-rating.entity';
import type { Subscription } from './subscription.entity';
import type { NotificationUser } from './notification-user.entity';
import type { Inventory } from './inventory.entity';

@Entity()
export class User {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @Column()
  email: string;

  @ApiHideProperty()
  @Column()
  password: string;

  @ApiProperty({
    description: 'Role ID (1=Client, 2=Barber, 3=Admin)',
    example: 1,
  })
  @Column({ default: 1 })
  role: number;

  @ApiProperty({
    description: 'National identification number',
    example: '12345678',
  })
  @Column({ unique: true })
  dni: string;

  @ManyToOne('Role', 'users', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role' })
  roleEntity: Role;

  @OneToMany('Support', 'usuario')
  supports: Support[];

  @OneToMany('AppointmentParticipant', 'user')
  appointmentParticipants: AppointmentParticipant[];

  @OneToMany('AppointmentRating', 'client')
  ratings: AppointmentRating[];

  @OneToMany('Subscription', 'user')
  subscriptions: Subscription[];

  @OneToMany('NotificationUser', 'user')
  notifications: NotificationUser[];

  @OneToMany('Inventory', 'user')
  inventory: Inventory[];
}
