import { Module } from '@nestjs/common';
import { DlpRuleService } from './dlp-rule.service';
import { DlpRuleController } from './dlp-rule.controller';

@Module({
  controllers: [DlpRuleController],
  providers: [DlpRuleService],
})
export class DlpRuleModule {}
