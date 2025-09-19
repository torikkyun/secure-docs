import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '@core/prisma/prisma.service';
import { AuthModule } from '@core/auth/auth.module';
import { RedisModule } from '@core/redis/redis.module';

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
