import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Support {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportDate: Date;

  @Column({ default: 'open', enum: ['open', 'in_progress', 'closed'] })
  state: string;

  @ManyToOne(() => User, (user) => user.supports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;
}
