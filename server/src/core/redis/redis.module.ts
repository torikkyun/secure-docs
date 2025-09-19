import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { createKeyv } from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

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
    RedisService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: CacheInterceptor,
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
