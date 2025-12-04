import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Appointment } from './appointment.entity';
import type { Service } from './service.entity';

@Entity()
export class AppointmentService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Appointment', 'services', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @ManyToOne('Service', 'appointmentServices', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
