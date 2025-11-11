import { BaseEntity } from "@core/database/base.entity";
import { UserRole } from "@modules/user-role/entities/user-role.entity";
import { UserStatus } from "@modules/user-status/entities/user-status.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ unique: true, nullable: false, length: 255 })
  email: string;

  @Column({ type: "text", nullable: true })
  publicKey?: string;

  @ManyToOne(() => UserRole, { nullable: false })
  @JoinColumn({ name: "role_id" })
  role: UserRole;

  @ManyToOne(() => UserStatus, { nullable: false })
  @JoinColumn({ name: "status_id" })
  status: UserStatus;

  @Column({ type: "jsonb", default: {} })
  metadata: Record<string, unknown>;
}
