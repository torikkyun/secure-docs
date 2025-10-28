import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { createKeyv } from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        stores: [
          createKeyv(configService.get<string>('REDIS_URL'), {
            namespace: 'nest',
            keyPrefixSeparator: '::',
          }),
        ],
        ttl: configService.get<number>('CACHE_TTL'),
        max: configService.get<number>('CACHE_LRU_SIZE'),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class RedisModule {}
