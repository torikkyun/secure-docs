import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies/snake-naming.strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/../../modules/**/entities/*.entity{.ts,.js}'],
        synchronize:
          configService.get('NODE_ENV') !== 'production' ? true : false,
        // logging: configService.get('NODE_ENV') !== 'production' ? true : false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
})
export class DatabaseModule {}
