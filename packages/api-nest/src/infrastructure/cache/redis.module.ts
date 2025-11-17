import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { UserAwareCacheInterceptor } from "./user-aware-cache.interceptor";

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get("redis");
        return {
          stores: [
            createKeyv(redisConfig.url, {
              namespace: "nest",
              keyPrefixSeparator: ":",
            }),
          ],
          ttl: redisConfig.ttl,
          max: redisConfig.lruSize,
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: UserAwareCacheInterceptor,
    },
  ],
})
export class RedisModule {}
