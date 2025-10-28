import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@core/database/base.entity';
import { UserRole } from '@modules/user-role/entities/user-role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, name: 'full_name' })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ type: 'text', nullable: true, name: 'public_key' })
  publicKey?: string;

  @Column({ type: 'text', nullable: true, name: 'private_key_encrypted' })
  privateKeyEncrypted?: string;

  @ManyToOne(() => UserRole, (role) => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: UserRole;
}
