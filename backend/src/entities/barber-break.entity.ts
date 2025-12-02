import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BarberDateSchedule } from './barber-date-schedule.entity';

@Entity()
export class BarberBreak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BarberDateSchedule, (dateSchedule) => dateSchedule.breaks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dateScheduleId' })
  dateSchedule: BarberDateSchedule;

  @Column({ type: 'time' })
  startTime: string; // Hora de inicio del descanso (ej: 13:00)

  @Column({ type: 'time' })
  endTime: string; // Hora de fin del descanso (ej: 15:00)

  @Column({ type: 'varchar', length: 100, nullable: true })
  reason: string; // Razón del descanso (ej: "Almuerzo", "Descanso")

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
