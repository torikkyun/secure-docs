import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '@core/prisma/prisma.service';
import { AuthenticationModule } from '@core/authentication/authentication.module';

@Module({
  imports: [AuthenticationModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
