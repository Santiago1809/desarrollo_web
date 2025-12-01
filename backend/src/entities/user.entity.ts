import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Support } from './support.entity';
import { AppointmentParticipant } from './appointment-participant.entity';
import { AppointmentRating } from './appointment-rating.entity';
import { Subscription } from './subscription.entity';
import { NotificationUser } from './notification-user.entity';
import { Inventory } from './inventory.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ default: 1 })
  role: number;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role' })
  roleEntity: Role;

  @OneToMany(() => Support, (support) => support.usuario)
  supports: Support[];

  @OneToMany(() => AppointmentParticipant, (participant) => participant.user)
  appointmentParticipants: AppointmentParticipant[];

  @OneToMany(() => AppointmentRating, (rating) => rating.client)
  ratings: AppointmentRating[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(
    () => NotificationUser,
    (notificationUser) => notificationUser.user,
  )
  notifications: NotificationUser[];

  @OneToMany(() => Inventory, (inventory) => inventory.user)
  inventory: Inventory[];
}
