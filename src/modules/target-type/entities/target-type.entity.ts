import { BaseEntity } from "@core/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity("target_types")
export class TargetType extends BaseEntity {
  @Column({ type: "varchar", length: 50, unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;
}
