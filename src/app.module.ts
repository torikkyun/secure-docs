import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from '@core/database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@common/guards/jwt.guard';
import configuration from './config/configuration';
import { RolesGuard } from '@common/guards/roles.guard';
import { RedisModule } from '@core/cache/redis.module';
import { UserRoleModule } from './modules/user-role/user-role.module';
import { DocumentStatusModule } from './modules/document-status/document-status.module';
import { TargetTypeModule } from './modules/target-type/target-type.module';
import { DocumentModule } from './modules/document/document.module';
import { ShareModule } from './modules/share/share.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { DlpRuleModule } from './modules/dlp-rule/dlp-rule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    DatabaseModule,
    RedisModule,
    UserRoleModule,
    DocumentStatusModule,
    TargetTypeModule,
    UserModule,
    DocumentModule,
    ShareModule,
    AuditLogModule,
    DlpRuleModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
