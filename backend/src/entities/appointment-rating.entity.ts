import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Appointment } from './appointment.entity';
import type { User } from './user.entity';

@Entity()
export class AppointmentRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Appointment', 'ratings', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @ManyToOne('User', 'ratings', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
