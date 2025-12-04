import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.entity';
import type { Appointment } from './appointment.entity';

@Entity()
export class AppointmentParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Appointment', 'participants', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @ManyToOne('User', 'appointmentParticipants', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    enum: ['client', 'barber'],
  })
  role: 'client' | 'barber';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
