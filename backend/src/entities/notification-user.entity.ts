import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Notification } from './notification.entity';
import type { User } from './user.entity';

@Entity()
export class NotificationUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Notification', 'users', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  @ManyToOne('User', 'notifications', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
