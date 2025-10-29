import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@core/database/base.entity';

@Entity({ name: 'dlp_rules' })
export class DlpRule extends BaseEntity {
  @Column('varchar', { name: 'keyword', length: 100, unique: true })
  keyword: string;

  @Column('varchar', { name: 'category', length: 50, nullable: true })
  category?: string;
}
