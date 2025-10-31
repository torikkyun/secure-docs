import { JwtGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
// import { RedisModule } from "@core/cache/redis.module";
import { DatabaseModule } from "@core/database/database.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import configuration from "./config/configuration";
import { AuditLogModule } from "./modules/audit-log/audit-log.module";
import { DlpRuleModule } from "./modules/dlp-rule/dlp-rule.module";
import { DocumentModule } from "./modules/document/document.module";
import { DocumentStatusModule } from "./modules/document-status/document-status.module";
import { ShareModule } from "./modules/share/share.module";
import { TargetTypeModule } from "./modules/target-type/target-type.module";
import { UserModule } from "./modules/user/user.module";
import { UserRoleModule } from "./modules/user-role/user-role.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    DatabaseModule,
    // RedisModule,
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
