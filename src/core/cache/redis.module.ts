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
      useFactory: (configService: ConfigService) => ({
        stores: [
          createKeyv(configService.get<string>("REDIS_URL"), {
            namespace: "nest",
            keyPrefixSeparator: ":",
          }),
        ],
        ttl: configService.get<number>("CACHE_TTL"),
        max: configService.get<number>("CACHE_LRU_SIZE"),
      }),
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
