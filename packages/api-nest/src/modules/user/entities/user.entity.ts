import { BaseEntity } from "@core/database/base.entity";
import { Role } from "@modules/role/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role: Role;
}
