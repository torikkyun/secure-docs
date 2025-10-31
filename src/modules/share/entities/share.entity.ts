import { BaseEntity } from "@core/database/base.entity";
import { Document } from "@modules/document/entities/document.entity";
import { User } from "@modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: "shares" })
export class Share extends BaseEntity {
  @ManyToOne(() => Document, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "document_id" })
  document: Document;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "receiver_id" })
  receiver: User;

  @Column("timestamp", {
    name: "share_time",
    default: () => "CURRENT_TIMESTAMP",
  })
  shareTime: Date;

  @Column("varchar", { name: "encrypted_hash", length: 64 })
  encryptedHash: string;

  @Column("text", { name: "digital_signature" })
  digitalSignature: string;

  @Column("varchar", { name: "blockchain_tx_id", length: 128, nullable: true })
  blockchainTxId?: string;

  @Column("boolean", { name: "is_verified", default: false })
  isVerified: boolean;

  @Column("timestamp", { name: "verified_at", nullable: true })
  verifiedAt?: Date;
}
