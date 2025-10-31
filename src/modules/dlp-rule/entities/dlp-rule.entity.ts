import { BaseEntity } from "@core/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: "dlp_rules" })
export class DlpRule extends BaseEntity {
  @Column("varchar", { name: "keyword", length: 100, unique: true })
  keyword: string;

  @Column("varchar", { name: "category", length: 50, nullable: true })
  category?: string;
}
