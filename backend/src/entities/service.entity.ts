import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { AppointmentService } from './appointment-service.entity';

@Entity()
export class Service {
  @ApiProperty({
    description: 'Unique identifier of the service',
    example: 1,
  })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: 'Name of the service',
    example: 'Haircut',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Duration of the service in minutes',
    example: 30,
  })
  @Column({ type: 'decimal' })
  duration: number;

  @ApiProperty({
    description: 'Price of the service',
    example: 25,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @OneToMany('AppointmentService', 'service')
  appointmentServices: AppointmentService[];

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
