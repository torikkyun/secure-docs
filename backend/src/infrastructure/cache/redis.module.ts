import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisService } from "./redis.service";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { UserAwareCacheInterceptor } from "./user-aware-cache.interceptor";

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.getOrThrow<{
          url: string;
          ttl: number;
          lruSize: number;
        }>("redis");
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
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
