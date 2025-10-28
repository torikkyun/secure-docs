import { BaseEntity } from '@core/database/base.entity';
import { Entity } from 'typeorm';
import { Column } from 'typeorm/decorator/columns/Column';

@Entity('document_statuses')
export class DocumentStatus extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
