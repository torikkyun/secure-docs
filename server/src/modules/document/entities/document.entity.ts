import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@core/database/base.entity';
import { DocumentStatus } from '@modules/document-status/entities/document-status.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity({ name: 'documents' })
export class Document extends BaseEntity {
  @ManyToOne(() => User, (user) => user.documents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar', { name: 'filename', length: 255 })
  filename: string;

  @Column('varchar', { name: 'file_hash', length: 64 })
  fileHash: string;

  @Column('text', { name: 'encrypted_file_path', nullable: true })
  encryptedFilePath?: string;

  @Column('varchar', {
    name: 'encryption_key_hash',
    length: 64,
    nullable: true,
  })
  encryptionKeyHash?: string;

  @Column('boolean', { name: 'is_sensitive', default: false })
  isSensitive: boolean;

  @Column('text', { name: 'sensitive_keywords', array: true, nullable: true })
  sensitiveKeywords?: string[];

  @ManyToOne(() => DocumentStatus, (status) => status.documents, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'status_id' })
  status: DocumentStatus;
}
