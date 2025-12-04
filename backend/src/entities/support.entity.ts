import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './user.entity';

@Entity()
export class Support {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportDate: Date;

  @Column({ default: 'open', enum: ['open', 'in_progress', 'closed'] })
  state: 'open' | 'in_progress' | 'closed';

  @Column({ type: 'text', nullable: true })
  adminResponse: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @ManyToOne('User', 'supports', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;
}
