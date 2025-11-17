import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtGuard } from "./common/guards/jwt.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import configuration from "./config/configuration";
import jwtConfig from "./config/jwt.config";
import redisConfig from "./config/redis.config";
import swaggerConfig from "./config/swagger.config";
import { PrismaModule } from "./database/prisma.module";
import { HealthModule } from "./infrastructure/health/health.module";
import { LoggerModule } from "./infrastructure/logging/logger.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RoleModule } from "./modules/role/role.module";
import { UserModule } from "./modules/user/user.module";

const guards = [JwtGuard, RolesGuard];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration, redisConfig, jwtConfig, swaggerConfig],
    }),
    PrismaModule,
    // RedisModule,
    LoggerModule,
    HealthModule,
    AuthModule,
    RoleModule,
    UserModule,
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
