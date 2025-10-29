import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@core/database/base.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog extends BaseEntity {
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column('varchar', { name: 'action', length: 50 })
  action: string;

  @Column('uuid', { name: 'target_id', nullable: true })
  targetId?: string;

  @Column('uuid', { name: 'target_type_id', nullable: true })
  targetTypeId?: string;

  @Column('varchar', { name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column('text', { name: 'user_agent', nullable: true })
  userAgent?: string;
}
