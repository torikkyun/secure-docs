import { Controller, Get } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';

@Controller('api/audit-logs')
@ApiTags('audit-logs')
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.auditLogsService.findAll();
  }
}
