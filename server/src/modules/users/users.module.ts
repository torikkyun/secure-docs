import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthenticationModule } from '@core/authentication/authentication.module';
import { PrismaService } from '@core/prisma/prisma.service';

@Module({
  imports: [AuthenticationModule],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, PrismaService],
})
export class UsersModule {}
