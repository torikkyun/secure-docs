import { Injectable } from '@nestjs/common';
import { CreateDlpRuleDto } from './dto/create-dlp-rule.dto';
import { UpdateDlpRuleDto } from './dto/update-dlp-rule.dto';

@Injectable()
export class DlpRuleService {
  create(createDlpRuleDto: CreateDlpRuleDto) {
    return 'This action adds a new dlpRule';
  }

  findAll() {
    return `This action returns all dlpRule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dlpRule`;
  }

  update(id: number, updateDlpRuleDto: UpdateDlpRuleDto) {
    return `This action updates a #${id} dlpRule`;
  }

  remove(id: number) {
    return `This action removes a #${id} dlpRule`;
  }
}
