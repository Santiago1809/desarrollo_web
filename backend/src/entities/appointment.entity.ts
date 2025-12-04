import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { AppointmentParticipant } from './appointment-participant.entity';
import type { AppointmentRating } from './appointment-rating.entity';
import type { AppointmentService } from './appointment-service.entity';

@Entity()
export class Appointment {
  @ApiProperty({
    description: 'Unique identifier of the appointment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany('AppointmentService', 'appointment')
  services: AppointmentService[];

  @ApiProperty({
    description: 'Date of the appointment',
  })
  @Column({ type: 'timestamp' })
  date: Date;

  @ApiProperty({
    description: 'Time of the appointment',
    example: '10:30',
  })
  @Column()
  hour: string;

  @ApiProperty({
    description: 'Current state of the appointment',
    enum: ['scheduled', 'cancelled', 'reschedulled', 'completed'],
    example: 'scheduled',
  })
  @Column({
    default: 'scheduled',
    enum: ['scheduled', 'cancelled', 'reschedulled'],
  })
  state: string;

  @ApiProperty({
    description: 'Total price of all services',
    example: 45,
  })
  @Column({ type: 'double precision' })
  totalPrice: number;

  @OneToMany('AppointmentParticipant', 'appointment')
  participants: AppointmentParticipant[];

  @OneToMany('AppointmentRating', 'appointment')
  ratings: AppointmentRating[];

  @ApiProperty({
    description: 'Creation timestamp',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
