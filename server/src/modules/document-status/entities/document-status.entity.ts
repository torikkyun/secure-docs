import { BaseEntity } from '@core/database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Document } from '@modules/document/entities/document.entity';

@Entity('document_statuses')
export class DocumentStatus extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Document, (document) => document.status)
  documents?: Document[];
}
