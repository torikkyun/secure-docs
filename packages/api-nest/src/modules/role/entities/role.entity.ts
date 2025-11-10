import { BaseEntity } from "@core/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity("roles")
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;
}
