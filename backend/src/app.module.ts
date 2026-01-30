import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { APP_GUARD } from "@nestjs/core";
import { JwtGuard } from "./common/guards/jwt.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import configuration from "./config/configuration";
import jwtConfig from "./config/jwt.config";
import redisConfig from "./config/redis.config";
import blockchainConfig from "./config/blockchain.config";
import { PrismaModule } from "./database/prisma.module";
import { HealthModule } from "./infrastructure/health/health.module";
import { LoggerModule } from "./infrastructure/logging/logger.module";
import { BlockchainModule } from "./infrastructure/blockchain/blockchain.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { FileModule } from "./modules/file/file.module";
import { ShareModule } from "./modules/share/share.module";
import { RedisModule } from "./infrastructure/cache/redis.module";
import { FileActivityModule } from "./modules/file-activity/file-activity.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration, redisConfig, jwtConfig, blockchainConfig],
    }),
    EventEmitterModule.forRoot({
      global: true,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    PrismaModule,
    // RedisModule,
    LoggerModule,
    BlockchainModule,
    HealthModule,
    AuthModule,
    UserModule,
    FileModule,
    ShareModule,
    FileActivityModule,
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
