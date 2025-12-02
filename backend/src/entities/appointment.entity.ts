import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AppointmentParticipant } from './appointment-participant.entity';
import { AppointmentRating } from './appointment-rating.entity';
import { AppointmentService } from './appointment-service.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.appointment,
  )
  services: AppointmentService[];

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  hour: string;

  @Column({
    default: 'scheduled',
    enum: ['scheduled', 'cancelled', 'reschedulled'],
  })
  state: string;

  @Column({ type: 'double precision' })
  totalPrice: number;

  @OneToMany(
    () => AppointmentParticipant,
    (participant) => participant.appointment,
  )
  participants: AppointmentParticipant[];

  @OneToMany(() => AppointmentRating, (rating) => rating.appointment)
  ratings: AppointmentRating[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
