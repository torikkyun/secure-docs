import { PartialType } from '@nestjs/swagger';
import { CreateDlpRuleDto } from './create-dlp-rule.dto';

export class UpdateDlpRuleDto extends PartialType(CreateDlpRuleDto) {}
