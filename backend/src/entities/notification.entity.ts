import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Appointment } from './appointment.entity';
import type { NotificationUser } from './notification-user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  message: string;

  @ManyToOne('Appointment', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @OneToMany('NotificationUser', 'notification')
  users: NotificationUser[];

  @Column({ type: 'timestamp' })
  sentDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
