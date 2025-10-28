import { BaseEntity } from '@core/database/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => User, (user) => user.role)
  users?: User[];
}
