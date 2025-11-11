import { BaseEntity } from "@core/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity("user_statuses")
export class UserStatus extends BaseEntity {
  @Column({ unique: true, nullable: false, type: "varchar", length: 50 })
  name: string;

  @Column({ nullable: true })
  description?: string;
}
