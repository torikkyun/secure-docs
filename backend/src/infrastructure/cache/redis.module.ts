import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RedisService } from "./redis.service";
import { CacheVersionService } from "./cache-version.service";

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
        }>("redis");
        return {
          stores: [
            createKeyv(redisConfig.url, {
              namespace: "nest",
              keyPrefixSeparator: ":",
            }),
          ],
        };
      },
    }),
  ],
  providers: [RedisService, CacheVersionService],
  exports: [CacheModule, RedisService, CacheVersionService],
})
export class RedisModule {}
