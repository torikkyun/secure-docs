import { Controller } from '@nestjs/common';
import { DlpRuleService } from './dlp-rule.service';

@Controller('dlp-rule')
export class DlpRuleController {
  constructor(private readonly dlpRuleService: DlpRuleService) {}
}
