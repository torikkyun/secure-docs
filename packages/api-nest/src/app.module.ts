import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtGuard } from "./common/guards/jwt.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import configuration from "./config/configuration";
import jwtConfig from "./config/jwt.config";
import redisConfig from "./config/redis.config";
import siweConfig from "./config/siwe.config";
import swaggerConfig from "./config/swagger.config";
import { PrismaModule } from "./database/prisma.module";
import { RedisModule } from "./infrastructure/cache/redis.module";
import { HealthModule } from "./infrastructure/health/health.module";
import { LoggerModule } from "./infrastructure/logging/logger.module";
import { AccessGrantModule } from "./modules/access-grant/access-grant.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DownloadModule } from "./modules/download/download.module";
import { FileModule } from "./modules/file/file.module";
import { UserModule } from "./modules/user/user.module";

const guards = [JwtGuard, RolesGuard];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration, redisConfig, jwtConfig, swaggerConfig, siweConfig],
    }),
    PrismaModule,
    RedisModule,
    LoggerModule,
    HealthModule,
    AuthModule,
    UserModule,
    FileModule,
    DownloadModule,
    AccessGrantModule,
    AuditModule,
  ],
  providers: [
    ...guards.map((Guard) => ({
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new Guard(reflector),
      inject: [Reflector],
    })),
  ],
})
export class AppModule {}
