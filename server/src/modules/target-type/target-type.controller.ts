import { Controller } from '@nestjs/common';
import { TargetTypeService } from './target-type.service';

@Controller('target-type')
export class TargetTypeController {
  constructor(private readonly targetTypeService: TargetTypeService) {}
}
