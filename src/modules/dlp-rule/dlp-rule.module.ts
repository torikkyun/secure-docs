import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DlpRuleController } from "./dlp-rule.controller";
import { DlpRuleService } from "./dlp-rule.service";
import { DlpRule } from "./entities/dlp-rule.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DlpRule])],
  controllers: [DlpRuleController],
  providers: [DlpRuleService],
  exports: [DlpRuleService],
})
export class DlpRuleModule {}
