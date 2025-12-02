import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AppointmentService } from './appointment-service.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  duration: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @OneToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.service,
  )
  appointmentServices: AppointmentService[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
