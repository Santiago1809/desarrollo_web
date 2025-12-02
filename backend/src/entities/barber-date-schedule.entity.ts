import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BarberBreak } from './barber-break.entity';

@Entity()
export class BarberDateSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'barberId' })
  barber: User;

  @Column({ type: 'date' })
  date: Date; // Fecha específica (ej: 2026-01-20)

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string; // Nota: "Cumpleaños", "Día no laboral", etc.

  @Column({ default: true })
  isWorkDay: boolean; // true = trabaja ese día, false = día no laboral

  @OneToMany(() => BarberBreak, (barberBreak) => barberBreak.dateSchedule, {
    cascade: true,
    eager: true,
  })
  breaks: BarberBreak[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
