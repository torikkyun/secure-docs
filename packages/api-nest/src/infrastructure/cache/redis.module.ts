import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisService } from "./redis.service";

@Module({
  imports: [
    ConfigModule,
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
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: UserAwareCacheInterceptor,
    // },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
