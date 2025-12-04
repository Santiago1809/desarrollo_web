import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.entity';

@Entity()
export class BarberSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barberId' })
  barber: User;

  @Column({ type: 'int' })
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @Column({ type: 'time' })
  startTime: string; // Format: HH:mm

  @Column({ type: 'time' })
  endTime: string; // Format: HH:mm

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
