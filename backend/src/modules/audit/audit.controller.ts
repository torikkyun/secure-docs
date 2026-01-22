import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@Controller('api/audit')
@ApiTags('audit')
@ApiBearerAuth()
export class AuditController {
  private readonly auditService: AuditService;
  constructor(auditService: AuditService) {
    this.auditService = auditService;
  }

  @Get()
  async findAll() {
    return await this.auditService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.auditService.findOne(id);
  }
}
