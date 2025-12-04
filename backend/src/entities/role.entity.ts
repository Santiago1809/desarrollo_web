import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { User } from './user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  name: string;

  @OneToMany('User', 'roleEntity')
  users: User[];
}
